const {
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  isNonNullType,
  isScalarType
} = require('graphql')
const { SchemaDirectiveVisitor } = require('apollo-server-express')

const ConstraintStringType = require('./scalars/string')
const ConstraintNumberType = require('./scalars/number')

class ConstraintDirective extends SchemaDirectiveVisitor {
  _getConstraintType (fieldName, type, notNull) {
    if (type === GraphQLString) {
      if (notNull) {
        return new GraphQLNonNull(new ConstraintStringType(fieldName, type, this.args))
      }
      return new ConstraintStringType(fieldName, type, this.args)
    }
    if (type === GraphQLFloat || type === GraphQLInt) {
      if (notNull) {
        return new GraphQLNonNull(new ConstraintNumberType(fieldName, type, this.args))
      }
      return new ConstraintNumberType(fieldName, type, this.args)
    }
    throw new Error(`Not a valid scalar type: ${type.toString()}`)
  }

  _wrapType (field) {
    const fieldName = field.astNode.name.value
    if (isNonNullType(field.type) && isScalarType(field.type.ofType)) {
      return this._getConstraintType(fieldName, field.type.ofType, true)
    }
    if (isScalarType(field.type)) {
      return this._getConstraintType(fieldName, field.type, false)
    }
    throw new Error(`Not a scalar type: ${field.type.toString()}`)
  }

  visitInputFieldDefinition (field) {
    field.type = this._wrapType(field)
  }

  visitFieldDefinition (field) {
    field.type = this._wrapType(field)
  }
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
    uniqueTypeName: String
  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION
`

module.exports = { ConstraintDirective, constraintDirectiveTypeDefs }
