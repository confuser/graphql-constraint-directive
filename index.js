const {
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  isNonNullType,
  isScalarType,
  GraphQLList,
  isListType
} = require('graphql')
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils')
const ConstraintStringType = require('./scalars/string')
const ConstraintNumberType = require('./scalars/number')

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
    if (type === GraphQLString) {
      if (notNull) {
        constraintType = new GraphQLNonNull(
          new ConstraintStringType(fieldName, uniqueTypeName, type, directiveArgumentMap)
        )
      } else {
        constraintType = new ConstraintStringType(
          fieldName,
          uniqueTypeName,
          type,
          directiveArgumentMap
        )
      }
    } else if (type === GraphQLFloat || type === GraphQLInt) {
      if (notNull) {
        constraintType = new GraphQLNonNull(
          new ConstraintNumberType(fieldName, uniqueTypeName, type, directiveArgumentMap)
        )
      } else {
        constraintType = new ConstraintNumberType(
          fieldName,
          uniqueTypeName,
          type,
          directiveArgumentMap
        )
      }
    } else {
      throw new Error(`Not a valid scalar type: ${type.toString()}`)
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

  function getScalarType (fieldConfig) {
    if (isScalarType(fieldConfig)) {
      return { scalarType: fieldConfig }
    } else if (isListType(fieldConfig)) {
      return { ...getScalarType(fieldConfig.ofType), list: true }
    } else if (isNonNullType(fieldConfig) && isScalarType(fieldConfig.ofType)) {
      return { scalarType: fieldConfig.ofType, scalarNotNull: true }
    } else if (isNonNullType(fieldConfig)) {
      return { ...getScalarType(fieldConfig.ofType.ofType), list: true, listNotNull: true }
    } else {
      throw new Error(`Not a valid scalar type: ${fieldConfig.toString()}`)
    }
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

module.exports = { constraintDirective, constraintDirectiveTypeDefs }
