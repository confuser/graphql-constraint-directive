const { GraphQLFloat, GraphQLInt, GraphQLString, isNonNullType, isScalarType } = require('graphql')
const { getDirectives, mapSchema, MapperKind } = require('graphql-tools')
const ConstraintStringType = require('./scalars/string')
const ConstraintNumberType = require('./scalars/number')

function constraintDirective () {
  const constraintTypes = {}

  function getConstraintType (fieldName, type, directiveArgumentMap) {
    // Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ as per graphql-js
    const uniqueTypeName = `${fieldName}_${type.name}_` + Object.entries(directiveArgumentMap)
      .map(([key, value]) => `${key}_${value.toString().replace(/\W/g, '')}`)
      .join('_')
    const key = Symbol.for(uniqueTypeName)
    let constraintType = constraintTypes[key]

    if (constraintType) return constraintType

    if (type === GraphQLString) {
      constraintType = new ConstraintStringType(fieldName, uniqueTypeName, type, directiveArgumentMap)
    } else if (type === GraphQLFloat || type === GraphQLInt) {
      constraintType = new ConstraintNumberType(fieldName, uniqueTypeName, type, directiveArgumentMap)
    } else {
      throw new Error(`Not a valid scalar type: ${type.toString()}`)
    }

    constraintTypes[key] = constraintType

    return constraintType
  }

  function wrapType (fieldConfig, directiveArgumentMap) {
    let originalType

    if (isNonNullType(fieldConfig.type)) {
      originalType = fieldConfig.type.ofType
    } else if (isScalarType(fieldConfig.type)) {
      originalType = fieldConfig.type
    } else {
      throw new Error(`Not a scalar type: ${fieldConfig.type.toString()}`)
    }

    const fieldName = fieldConfig.astNode.name.value

    fieldConfig.type = getConstraintType(fieldName, originalType, directiveArgumentMap)
  }

  return schema => mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      const directives = getDirectives(schema, fieldConfig)
      const directiveArgumentMap = directives.constraint

      if (directiveArgumentMap) {
        wrapType(fieldConfig, directiveArgumentMap)

        return fieldConfig
      }
    }
  })
}

const constraintDirectiveTypeDefs = `
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
    min: Int
    max: Int
    exclusiveMin: Int
    exclusiveMax: Int
    multipleOf: Int
  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION`

module.exports = { constraintDirective, constraintDirectiveTypeDefs }
