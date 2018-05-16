const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')

module.exports = class ConstraintNumberType extends GraphQLScalarType {
  constructor (type, args) {
    super({
      name: `ConstraintNumber`,
      serialize (value) {
        return type.serialize(value)
      },
      parseValue (value) {
        value = type.serialize(value)

        if (args.min && value < args.min) {
          throw new GraphQLError(`Must be at least ${args.min}`)
        }
        if (args.max && value > args.max) {
          throw new GraphQLError(`Must be no greater than ${args.max}`)
        }

        if (args.exclusiveMin && value <= args.exclusiveMin) {
          throw new GraphQLError(`Must be greater than ${args.exclusiveMin}`)
        }
        if (args.exclusiveMax && value >= args.exclusiveMax) {
          throw new GraphQLError(`Must be no greater than ${args.exclusiveMax}`)
        }

        if (args.multipleOf && value % args.multipleOf !== 0) {
          throw new GraphQLError(`Must be a multiple of ${args.multipleOf}`)
        }

        return type.parseValue(value)
      },
      parseLiteral (ast) {
        return type.parseLiteral(ast)
      }
    })
  }
}
