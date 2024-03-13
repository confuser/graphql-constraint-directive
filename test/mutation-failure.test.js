const { strictEqual } = require('assert')

module.exports.test = function (setup, implType) {
  describe('GraphQL schema setup', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
            book: Book
        }
        type Book {
            title: String
        }
      `

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    describe('Mutation operation failure', function () {
      it('should fail but not throw "Cannot read properties of undefined (reading \'getFields\')"', async function () {
        const query = /* GraphQL */`
          mutation GetBook {
            book {
                title
            }
          }
        `

        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        strictEqual(
          statusCode,
          200,
          'Expected HTTP status code 200 for successful GraphQL query execution.'
        )
        strictEqual(
          body.errors[0].message,
          'Schema is not configured to execute mutation operation.',
          'Expected error message indicating failure in mutation operation.'
        )
      })
    })
  })
}
