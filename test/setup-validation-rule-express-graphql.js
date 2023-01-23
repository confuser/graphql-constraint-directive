const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const request = require('supertest')
const { createQueryValidationRule, constraintDirectiveTypeDefs } = require('..')

module.exports = async function ({ typeDefs, formatError, resolvers, schemaCreatedCallback }) {
  let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

  if (schemaCreatedCallback) {
    schema = schemaCreatedCallback(schema)
  }

  const app = express()

  app.use(
    '/',
    graphqlHTTP(async (request, response, { variables }) => ({
      schema,
      validationRules: [
        createQueryValidationRule({
          variables
        })
      ]
    }))
  )

  return request(app)
}
