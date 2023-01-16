const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const request = require('supertest')
const { createApolloQueryValidationPlugin, constraintDirectiveTypeDefs } = require('..')

module.exports = async function ({ typeDefs, formatError, resolvers, schemaCreatedCallback }) {
  let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

  if (schemaCreatedCallback) {
    schema = schemaCreatedCallback(schema)
  }

  const plugins = [
    createApolloQueryValidationPlugin({
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

  server.applyMiddleware({ app })

  return request(app)
}
