const { GraphQLError } = require('graphql/error')
const { isURL } = require('validator')

module.exports = (value) => {
  if (isURL(value)) return true

  throw new GraphQLError('Must be in URI format')
}
