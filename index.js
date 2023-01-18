const {
  GraphQLNonNull,
  GraphQLList,
  TypeInfo,
  ValidationContext,
  visit,
  visitWithTypeInfo,
  separateOperations,
  GraphQLError
} = require('graphql')
const QueryValidationVisitor = require('./lib/query-validation-visitor.js')
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils')
const { getConstraintTypeObject, getScalarType } = require('./lib/type-utils')
const { constraintDirectiveTypeDefs } = require('./lib/type-defs')

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

function validateQuery (schema, query, variables, operationName) {
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
    operationName
  })

  visit(query, visitWithTypeInfo(typeInfo, visitor))

  return errors
}

function createApolloQueryValidationPlugin ({ schema }) {
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
            request.operationName
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

function createEnvelopQueryValidationPlugin () {
  return {
    onExecute ({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName)
      if (errors.length > 0) {
        setResultAndStopExecution({ errors: errors.map(err => { return new GraphQLError(err.message, err, { code: err.code, field: err.fieldName, context: err.context, exception: err.originalError }) }) })
      }
    }
  }
}

function createQueryValidationRule (options) {
  return (context) => {
    return new QueryValidationVisitor(context, options)
  }
}

module.exports = { constraintDirective, constraintDirectiveTypeDefs, validateQuery, createApolloQueryValidationPlugin, createEnvelopQueryValidationPlugin, createQueryValidationRule }
