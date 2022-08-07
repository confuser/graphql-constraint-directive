const { GraphQLScalarType } = require('graphql')
const { contains, isLength } = require('validator')
const listValidate = require('./list')
const formats = require('./formats')
const ValidationError = require('../lib/error')

module.exports = class ConstraintStringType extends GraphQLScalarType {
  constructor (fieldName, uniqueTypeName, type, args, isNotNull) {
    super({
      name: uniqueTypeName,
      serialize (value) {
        if (isNotNull !== undefined) {
          listValidate(fieldName, args, value, isNotNull)
          value.forEach((item) => item !== undefined && item !== null && validate(fieldName, args, item))
          return value
        }
        value = type.serialize(value)
        validate(fieldName, args, value)
        return value
      },
      parseValue (value) {
        if (isNotNull !== undefined) {
          listValidate(fieldName, args, value, isNotNull)
          value.forEach((item) => item !== undefined && item !== null && validate(fieldName, args, item))
          return value
        }
        value = type.serialize(value)
        validate(fieldName, args, value)
        return type.parseValue(value)
      },
      parseLiteral (ast) {
        if (isNotNull !== undefined) {
          const values = ast.values.map(({ value }) => value)
          listValidate(fieldName, args, values, isNotNull)
          values.forEach((value) => value !== undefined && value !== null && validate(fieldName, args, value))
          return values
        }
        const value = type.parseLiteral(ast)
        validate(fieldName, args, value)
        return value
      }
    })
  }
}

function validate (fieldName, args, value) {
  if (args.minLength && !isLength(value, { min: args.minLength })) {
    throw new ValidationError(
      fieldName,
      `Must be at least ${args.minLength} characters in length`,
      [{ arg: 'minLength', value: args.minLength }]
    )
  }
  if (args.maxLength && !isLength(value, { max: args.maxLength })) {
    throw new ValidationError(
      fieldName,
      `Must be no more than ${args.maxLength} characters in length`,
      [{ arg: 'maxLength', value: args.maxLength }]
    )
  }

  if (args.startsWith && !value.startsWith(args.startsWith)) {
    throw new ValidationError(fieldName, `Must start with ${args.startsWith}`, [
      { arg: 'startsWith', value: args.startsWith }
    ])
  }

  if (args.endsWith && !value.endsWith(args.endsWith)) {
    throw new ValidationError(fieldName, `Must end with ${args.endsWith}`, [
      { arg: 'endsWith', value: args.endsWith }
    ])
  }

  if (args.contains && !contains(value, args.contains)) {
    throw new ValidationError(fieldName, `Must contain ${args.contains}`, [
      { arg: 'contains', value: args.contains }
    ])
  }

  if (args.notContains && contains(value, args.notContains)) {
    throw new ValidationError(
      fieldName,
      `Must not contain ${args.notContains}`,
      [{ arg: 'notContains', value: args.notContains }]
    )
  }

  if (args.pattern && !new RegExp(args.pattern).test(value)) {
    throw new ValidationError(fieldName, `Must match ${args.pattern}`, [
      { arg: 'pattern', value: args.pattern }
    ])
  }

  if (args.format) {
    const formatter = formats[args.format]

    if (!formatter) {
      throw new ValidationError(
        fieldName,
        `Invalid format type ${args.format}`,
        [{ arg: 'format', value: args.format }]
      )
    }

    try {
      formatter(value) // Will throw if invalid
    } catch (e) {
      throw new ValidationError(fieldName, e.message, [
        { arg: 'format', value: args.format }
      ])
    }
  }
}
