const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const request = require('supertest')
const { createQueryValidationRule, constraintDirectiveTypeDefs } = require('..')

module.exports = async function (typeDefs, formatError, resolvers) {
  const schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
  })

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
