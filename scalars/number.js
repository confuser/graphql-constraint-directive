const { GraphQLScalarType } = require('graphql')
const ValidationError = require('../lib/error')

module.exports = class ConstraintNumberType extends GraphQLScalarType {
  constructor (fieldName, type, args) {
    super({
      name: `ConstraintNumber`,
      serialize (value) {
        return type.serialize(value)
      },
      parseValue (value) {
        value = type.serialize(value)

        if (args.min && value < args.min) {
          throw new ValidationError(fieldName,
            `Must be at least ${args.min}`,
            [{ arg: 'min', value: args.min }])
        }
        if (args.max && value > args.max) {
          throw new ValidationError(fieldName,
            `Must be no greater than ${args.max}`,
            [{ arg: 'max', value: args.max }])
        }

        if (args.exclusiveMin && value <= args.exclusiveMin) {
          throw new ValidationError(fieldName,
            `Must be greater than ${args.exclusiveMin}`,
            [{ arg: 'exclusiveMin', value: args.exclusiveMin }])
        }
        if (args.exclusiveMax && value >= args.exclusiveMax) {
          throw new ValidationError(fieldName,
            `Must be no greater than ${args.exclusiveMax}`,
            [{ arg: 'exclusiveMax', value: args.exclusiveMax }])
        }

        if (args.multipleOf && value % args.multipleOf !== 0) {
          throw new ValidationError(fieldName,
            `Must be a multiple of ${args.multipleOf}`,
            [{ arg: 'multipleOf', value: args.multipleOf }])
        }

        return type.parseValue(value)
      },
      parseLiteral (ast) {
        return type.parseLiteral(ast)
      }
    })
  }
}
