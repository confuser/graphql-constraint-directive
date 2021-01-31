const express = require('express')
const { ApolloServer, SchemaDirectiveVisitor, makeExecutableSchema } = require(
  'apollo-server-express')
const request = require('supertest')
const { ConstraintDirective, constraintDirectiveTypeDefs } = require('../')

module.exports = function (typeDefs, formatError, resolvers) {
  const schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })
  SchemaDirectiveVisitor.visitSchemaDirectives(schema, {
    constraint: ConstraintDirective
  })
  const app = express()
  const server = new ApolloServer({ schema, formatError })

  server.applyMiddleware({ app })

  return request(app)
}
