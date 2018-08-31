const { GraphQLError } = require('graphql/error')
const { isRFC3339 } = require('validator')

module.exports = (value) => {
  if (isRFC3339(value)) return true

  throw new GraphQLError('Must be a date-time in RFC 3339 format')
}
