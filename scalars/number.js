const { GraphQLScalarType } = require('graphql')
const ValidationError = require('../lib/error')

module.exports = class ConstraintNumberType extends GraphQLScalarType {
  constructor (fieldName, uniqueTypeName, type, args) {
    super({
      name: uniqueTypeName,
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
}

function divisible (a, b) {
  const eps = Number.EPSILON * 3
  return a % b < eps || a % b > b - eps
}

function validate (fieldName, args, value) {
  if (args.min !== undefined && value < args.min) {
    throw new ValidationError(fieldName,
      `Must be at least ${args.min}`,
      [{ arg: 'min', value: args.min }])
  }
  if (args.max !== undefined && value > args.max) {
    throw new ValidationError(fieldName,
      `Must be no greater than ${args.max}`,
      [{ arg: 'max', value: args.max }])
  }

  if (args.exclusiveMin !== undefined && value <= args.exclusiveMin) {
    throw new ValidationError(fieldName,
      `Must be greater than ${args.exclusiveMin}`,
      [{ arg: 'exclusiveMin', value: args.exclusiveMin }])
  }
  if (args.exclusiveMax !== undefined && value >= args.exclusiveMax) {
    throw new ValidationError(fieldName,
      `Must be less than ${args.exclusiveMax}`,
      [{ arg: 'exclusiveMax', value: args.exclusiveMax }])
  }

  if (args.multipleOf !== undefined && divisible(value, args.multipleOf) === false) {
    throw new ValidationError(fieldName,
      `Must be a multiple of ${args.multipleOf}`,
      [{ arg: 'multipleOf', value: args.multipleOf }])
  }
}
