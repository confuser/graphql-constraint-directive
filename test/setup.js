const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const request = require('supertest')
const { constraintDirective, constraintDirectiveTypeDefs } = require('../')

module.exports = function (typeDefs, formatError, resolvers) {
  const schema = makeExecutableSchema({
    typeDefs: [ constraintDirectiveTypeDefs, typeDefs ],
    schemaTransforms: [constraintDirective()],
    resolvers
  })
  const app = express()

  app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, formatError }))

  return request(app)
}
