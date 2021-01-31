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
  _getTypeName (type, notNull) {
    if (this.args.uniqueTypeName) {
      return this.args.uniqueTypeName.replace(/\W/g, '')
    }

    return `${type.name}${notNull ? '!_' : '_'}` +
      Object.entries(this.args)
        .map(([key, value]) => `${key}_${value.toString().replace(/\W/g, '')}`)
        .join('_')
  }

  _getConstraintType (fieldName, type, notNull) {
    const typeName = this._getTypeName(type, notNull)

    if (type === GraphQLString) {
      const stringType = new ConstraintStringType(fieldName, type, this.args, typeName)
      if (notNull) {
        return new GraphQLNonNull(stringType)
      }

      return stringType
    }

    if (type === GraphQLFloat || type === GraphQLInt) {
      const numberType = new ConstraintNumberType(fieldName, type, this.args, typeName)
      if (notNull) {
        return new GraphQLNonNull(numberType)
      }

      return numberType
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
