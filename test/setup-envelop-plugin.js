const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { createServer } = require('@graphql-yoga/node')
const request = require('supertest')
const { createEnvelopQueryValidationPlugin, constraintDirectiveTypeDefs } = require('..')

module.exports = async function (typeDefs, formatError, resolvers) {
  const schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

  const app = express()
  const yoga = createServer({
    schema,
    plugins: [createEnvelopQueryValidationPlugin()],
    graphiql: false
  })

  app.use('/', yoga)

  return request(app)
}
