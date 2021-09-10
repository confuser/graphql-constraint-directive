const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const request = require('supertest')
const { constraintDirective, constraintDirectiveTypeDefs } = require('../')

module.exports = function (typeDefs, formatError, resolvers) {
  let schema = makeExecutableSchema({
    typeDefs: [ constraintDirectiveTypeDefs, typeDefs ],
    resolvers
  })
  schema = constraintDirective()(schema)

  const app = express()
  const server = new ApolloServer({ schema, formatError })

  server.applyMiddleware({ app })

  return request(app)
}
