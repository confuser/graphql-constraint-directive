const { GraphQLError } = require('graphql/error')
const { isBase64 } = require('validator')

module.exports = (value) => {
  if (isBase64(value)) return true

  throw new GraphQLError('Must be in byte format')
}
