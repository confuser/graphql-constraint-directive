const {
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLScalarType,
  isNonNullType,
  isScalarType
} = require('graphql')
const { SchemaDirectiveVisitor } = require('apollo-server-express')

const { validateString, validateNumber } = require('./validators')

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

  _getTypeConfig (fieldName, type, notNull, validate, args) {
    return new GraphQLScalarType({
      name: this._getTypeName(type, notNull),
      serialize (value) {
        value = type.serialize(value)

        validate(fieldName, args, value)

        return value
      },
      parseValue (value) {
        value = type.serialize(value)

        validate(fieldName, args, value)

        return type.parseValue(value)
      },
      parseLiteral (ast) {
        const value = type.parseLiteral(ast)

        validate(fieldName, args, value)

        return value
      }
    })
  }

  _getConstraintType (fieldName, type, notNull) {
    if (type === GraphQLString) {
      const stringType = this._getTypeConfig(fieldName, type, notNull, validateString, this.args)
      if (notNull) {
        return new GraphQLNonNull(stringType)
      }

      return stringType
    }

    if (type === GraphQLFloat || type === GraphQLInt) {
      const numberType = this._getTypeConfig(fieldName, type, notNull, validateNumber, this.args)
      if (notNull) {
        return new GraphQLNonNull(numberType)
      }

      return numberType
    }

    throw new Error(`Not a supported scalar type: ${type.toString()}`)
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
