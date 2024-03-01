const { strictEqual } = require('assert')

module.exports.test = function (setup, implType) {
  describe('Union', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
            book: Book
        }
        type Book {
            title: String
            authors(max: Int @constraint(min: 5)): [String]
        }
      `

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    describe('Inlined value', function () {
      it('should fail', async function () {
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
          'Schema is not configured to execute mutation operation.'
        )
      })
    })
  })
}
