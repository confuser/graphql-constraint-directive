const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const cors = require('cors')
const { json } = require('body-parser')
const request = require('supertest')
const { createApollo4QueryValidationPlugin, constraintDirectiveTypeDefs } = require('../apollo4')

module.exports = async function ({ typeDefs, formatError, resolvers, schemaCreatedCallback }) {
  let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

  if (schemaCreatedCallback) {
    schema = schemaCreatedCallback(schema)
  }

  const plugins = [
    createApollo4QueryValidationPlugin({
      schema
    })
  ]

  const app = express()
  const server = new ApolloServer({
    schema,
    formatError,
    plugins
  })

  await server.start()

  app.use(
    '/',
    cors(),
    json(),
    expressMiddleware(server)
  )

  return request(app)
}
