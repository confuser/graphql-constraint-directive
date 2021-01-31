const { GraphQLError } = require('graphql/error')
const { isIP } = require('validator')

module.exports = (value) => {
  if (isIP(value, 4)) return true

  throw new GraphQLError('Must be in IP v4 format')
}
