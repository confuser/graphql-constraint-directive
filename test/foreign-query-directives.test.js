const { deepStrictEqual, strictEqual } = require('assert')

module.exports.test = function (setup, implType) {
  describe('Directive Argument Handling', function () {
    before(async function () {
      this.typeDefs = `
        directive @component(name: String!) on QUERY | MUTATION | SUBSCRIPTION

        type Query {
          getUsers: [User]
        }

        type User {
          id: ID
          name: String
          email: String
        }
      `

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    it("should not throw \"Cannot read properties of undefined (reading 'args')\" error when querying", async function () {
      const query = `
        query GetCurrentUser @component(name: "exampleComponent") {
          getUsers {
            id
            name
            email
          }
        }
      `
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      // Check for successful execution and no errors in the response
      strictEqual(
        statusCode,
        200,
        'Expected HTTP status code 200 for successful GraphQL query execution.'
      )
      deepStrictEqual(
        body.errors,
        undefined,
        'Expected no errors in the GraphQL response.'
      )
    })
  })
}
