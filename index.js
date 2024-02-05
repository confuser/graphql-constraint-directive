const {
  GraphQLNonNull,
  GraphQLList,
  TypeInfo,
  ValidationContext,
  visit,
  visitWithTypeInfo,
  separateOperations,
  GraphQLError,
  getDirectiveValues
} = require('graphql')
const QueryValidationVisitor = require('./lib/query-validation-visitor.js')
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils')
const { getConstraintTypeObject, getScalarType } = require('./lib/type-utils')
const { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj } = require('./lib/type-defs')

function constraintDirective () {
  const constraintTypes = {}

  function getConstraintType (fieldName, type, notNull, directiveArgumentMap, list, listNotNull) {
  // Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ as per graphql-js
    let uniqueTypeName
    if (directiveArgumentMap.uniqueTypeName) {
      uniqueTypeName = directiveArgumentMap.uniqueTypeName.replace(/\W/g, '')
    } else {
      uniqueTypeName =
                `${fieldName}_${list ? 'List_' : ''}${listNotNull ? 'ListNotNull_' : ''}${
                  type.name
                }_${notNull ? 'NotNull_' : ''}` +
                Object.entries(directiveArgumentMap)
                  .map(([key, value]) => {
                    if (
                      key === 'min' ||
                            key === 'max' ||
                            key === 'exclusiveMin' ||
                            key === 'exclusiveMax' ||
                            key === 'multipleOf'
                    ) {
                      return `${key}_${value.toString().replace(/\W/g, 'dot')}`
                    }
                    return `${key}_${value.toString().replace(/\W/g, '')}`
                  })
                  .join('_')
    }
    const key = Symbol.for(uniqueTypeName)
    let constraintType = constraintTypes[key]
    if (constraintType) return constraintType
    constraintType = getConstraintTypeObject(fieldName, type, uniqueTypeName, directiveArgumentMap)
    if (notNull) {
      constraintType = new GraphQLNonNull(constraintType)
    }
    if (list) {
      constraintType = new GraphQLList(constraintType)
      if (listNotNull) {
        constraintType = new GraphQLNonNull(constraintType)
      }
    }
    constraintTypes[key] = constraintType

    return constraintType
  }

  function wrapType (fieldConfig, directiveArgumentMap) {
    const result = getScalarType(fieldConfig.type)
    const fieldName = fieldConfig.astNode.name.value
    fieldConfig.type = getConstraintType(
      fieldName,
      result.scalarType,
      result.scalarNotNull,
      directiveArgumentMap,
      result.list,
      result.listNotNull
    )
  }

  return (schema) =>
    mapSchema(schema, {
      [MapperKind.FIELD]: (fieldConfig) => {
        const directiveArgumentMap = getDirective(schema, fieldConfig, 'constraint')?.[0]

        if (directiveArgumentMap) {
          wrapType(fieldConfig, directiveArgumentMap)

          return fieldConfig
        }
      },
      [MapperKind.ARGUMENT]: (fieldConfig) => {
        const directiveArgumentMap = getDirective(schema, fieldConfig, 'constraint')?.[0]

        if (directiveArgumentMap) {
          wrapType(fieldConfig, directiveArgumentMap)

          return fieldConfig
        }
      }
    })
}

function constraintDirectiveDocumentation (options) {
  // Default descriptions, can be changed through options
  let DESCRIPTINS_MAP = {
    minLength: 'Minimal length',
    maxLength: 'Maximal length',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    contains: 'Contains',
    notContains: 'Doesn\'t contain',
    pattern: 'Must match RegEx pattern',
    format: 'Must match format',
    min: 'Minimal value',
    max: 'Maximal value',
    exclusiveMin: 'Grater than',
    exclusiveMax: 'Less than',
    multipleOf: 'Must be a multiple of',
    minItems: 'Minimal number of items',
    maxItems: 'Maximal number of items'
  }

  if (options?.descriptionsMap) {
    DESCRIPTINS_MAP = options.descriptionsMap
  }

  let HEADER = '*Constraints:*'
  if (options?.header) {
    HEADER = options.header
  }

  function documentConstraintDirective (fieldConfig, directiveArgumentMap) {
    if (fieldConfig.description) {
      // skip documentation if it is already here
      if (fieldConfig.description.includes(HEADER)) return

      // add two new lines to separate from previous description by paragraph
      fieldConfig.description += '\n\n'
    } else {
      fieldConfig.description = ''
    }

    fieldConfig.description += HEADER + '\n'

    Object.entries(directiveArgumentMap).forEach(([key, value]) => {
      if (key === 'uniqueTypeName') return
      fieldConfig.description += `* ${DESCRIPTINS_MAP[key] ? DESCRIPTINS_MAP[key] : key}: \`${value}\`\n`
    })

    if (fieldConfig.astNode?.description) { fieldConfig.astNode.description.value = fieldConfig.description }
  }

  return (schema) =>
    mapSchema(schema, {
      [MapperKind.FIELD]: (fieldConfig) => {
        if (fieldConfig?.astNode) {
          const directiveArgumentMap = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode)

          if (directiveArgumentMap) {
            documentConstraintDirective(fieldConfig, directiveArgumentMap)

            return fieldConfig
          }
        }
      },
      [MapperKind.ARGUMENT]: (fieldConfig) => {
        if (fieldConfig?.astNode) {
          const directiveArgumentMap = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode)

          if (directiveArgumentMap) {
            documentConstraintDirective(fieldConfig, directiveArgumentMap)

            return fieldConfig
          }
        }
      }
    })
}

function validateQuery (schema, query, variables, operationName, pluginOptions = {}) {
  const typeInfo = new TypeInfo(schema)

  const errors = []
  const context = new ValidationContext(
    schema,
    query,
    typeInfo,
    (error) => errors.push(error)
  )

  const visitor = new QueryValidationVisitor(context, {
    variables,
    operationName,
    pluginOptions
  })

  visit(query, visitWithTypeInfo(typeInfo, visitor))

  return errors
}

function createApolloQueryValidationPlugin ({ schema }, options = {}) {
  return {
    async requestDidStart () {
      return ({
        async didResolveOperation ({ request, document }) {
          const query = request.operationName
            ? separateOperations(document)[request.operationName]
            : document

          const errors = validateQuery(
            schema,
            query,
            request.variables,
            request.operationName,
            options
          )
          if (errors.length > 0) {
            throw errors.map(err => {
              const { UserInputError } = require('apollo-server-errors')
              return new UserInputError(err.message, { field: err.fieldName, context: err.context })
            })
          }
        }
      })
    }
  }
}

function createEnvelopQueryValidationPlugin (options = {}) {
  return {
    onExecute ({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName, options)
      if (errors.length > 0) {
        setResultAndStopExecution({ errors: errors.map(err => { return new GraphQLError(err.message, { extensions: { code: err.code, field: err.fieldName, context: err.context } }) }) })
      }
    }
  }
}

function createQueryValidationRule (options) {
  return (context) => {
    return new QueryValidationVisitor(context, options)
  }
}

module.exports = { constraintDirective, constraintDirectiveDocumentation, constraintDirectiveTypeDefs, validateQuery, createApolloQueryValidationPlugin, createEnvelopQueryValidationPlugin, createQueryValidationRule }
