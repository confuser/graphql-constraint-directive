const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const request = require('supertest')
const { constraintDirectiveTypeDefs, constraintDirective, createApolloQueryValidationPlugin } = require('../')

module.exports = async function (typeDefs, formatError, resolvers) {
  let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

  const plugins = []
  if (process.env.VALIDATOR_TYPE === 'apollo') {
    plugins.push(
      createApolloQueryValidationPlugin({
        schema
      })
    )
  } else {
    schema = constraintDirective()(schema)
  }

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
