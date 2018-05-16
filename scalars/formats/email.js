const { GraphQLError } = require('graphql/error')
const { isEmail } = require('validator')

module.exports = (value) => {
  if (isEmail(value)) return true

  throw new GraphQLError('Must be in email format')
}
