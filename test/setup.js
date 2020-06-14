const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const request = require('supertest')
const { constraintDirective, constraintDirectiveTypeDefs } = require('../')

module.exports = function (typeDefs, formatError, resolvers) {
  const schema = makeExecutableSchema({
    typeDefs: [ constraintDirectiveTypeDefs, typeDefs ],
    schemaTransforms: [constraintDirective()],
    resolvers
  })
  const app = express()
  const server = new ApolloServer({ schema, formatError })

  server.applyMiddleware({ app })

  return request(app)
}
