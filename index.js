const {
  GraphQLNonNull,
  GraphQLList,
  TypeInfo,
  ValidationContext,
  visit,
  visitWithTypeInfo,
  separateOperations
} = require('graphql')
const QueryValidationVisitor = require('./lib/QueryValidationVisitor.js')
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils')
const { getConstraintTypeObject, getScalarType } = require('./lib/typeutils')

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
  console.log('validateQuery')
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
          console.log('Apollo didResolveOperation starts')
          const query = request.operationName
            ? separateOperations(document)[request.operationName]
            : document

          const errors = validateQuery(
            schema,
            query,
            request.variables,
            request.operationName
          )
          console.log('Apollo didResolveOperation finishes with errors: ' + errors)
          if (errors.length > 0) {
            throw errors
          }
        }
      })
    }
  }
}

const constraintDirectiveTypeDefs = /* GraphQL */`
  directive @constraint(
    # String constraints
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    contains: String
    notContains: String
    pattern: String
    format: String

    # Number constraints
    min: Float
    max: Float
    exclusiveMin: Float
    exclusiveMax: Float
    multipleOf: Float
    uniqueTypeName: String
  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION`

module.exports = { constraintDirective, constraintDirectiveTypeDefs, validateQuery, createApolloQueryValidationPlugin }
