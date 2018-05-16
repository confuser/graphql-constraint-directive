const { GraphQLError } = require('graphql/error')
const { isUUID } = require('validator')

module.exports = (value) => {
  if (isUUID(value)) return true

  throw new GraphQLError('Must be in UUID format')
}
