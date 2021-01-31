const { GraphQLError } = require('graphql/error')
const { isISO8601 } = require('validator')

module.exports = (value) => {
  if (isISO8601(value)) return true

  throw new GraphQLError('Must be a date in ISO 8601 format')
}
