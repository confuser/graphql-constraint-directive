const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { createServer } = require('@graphql-yoga/node')
const request = require('supertest')
const { createEnvelopQueryValidationPlugin, constraintDirectiveTypeDefs } = require('..')

module.exports = async function ({ typeDefs, formatError, resolvers, schemaCreatedCallback }) {
  let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

  if (schemaCreatedCallback) {
    schema = schemaCreatedCallback(schema)
  }

  const app = express()
  const yoga = createServer({
    schema,
    plugins: [createEnvelopQueryValidationPlugin()],
    graphiql: false
  })

  app.use('/', yoga)

  return request(app)
}
