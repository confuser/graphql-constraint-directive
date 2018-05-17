const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const { contains, isLength } = require('validator')
const formats = require('./formats')

module.exports = class ConstraintStringType extends GraphQLScalarType {
  constructor (type, args) {
    super({
      name: `ConstraintString`,
      serialize (value) {
        return type.serialize(value)
      },
      parseValue (value) {
        value = type.serialize(value)

        validate(args, value)

        return type.parseValue(value)
      },
      parseLiteral (ast) {
        const value = type.parseLiteral(ast)

        validate(args, value)

        return value
      }
    })
  }
}

function validate (args, value) {
  if (args.minLength && !isLength(value, { min: args.minLength })) {
    throw new GraphQLError(`Must be at least ${args.minLength} characters in length`)
  }
  if (args.maxLength && !isLength(value, { max: args.maxLength })) {
    throw new GraphQLError(`Must be no more than ${args.maxLength} characters in length`)
  }

  if (args.startsWith && !value.startsWith(args.startsWith)) {
    throw new GraphQLError(`Must start with ${args.startsWith}`)
  }

  if (args.endsWith && !value.endsWith(args.endsWith)) {
    throw new GraphQLError(`Must end with ${args.endsWith}`)
  }

  if (args.contains && !contains(value, args.contains)) {
    throw new GraphQLError(`Must contain ${args.contains}`)
  }

  if (args.notContains && contains(value, args.notContains)) {
    throw new GraphQLError(`Must not contain ${args.notContains}`)
  }

  if (args.pattern && !new RegExp(args.pattern).test(value)) {
    throw new GraphQLError(`Must match ${args.pattern}`)
  }

  if (args.format) {
    const formatter = formats[args.format]

    if (!formatter) throw new GraphQLError(`Invalid format type ${args.format}`)

    formatter(value) // Will throw if invalid
  }
}
