const { deepStrictEqual, strictEqual } = require('assert')
const { formatError } = require('./testutils')

exports.test = function (setup, implType) {
  describe('@constraint Int in ARGUMENT_DEFINITION with value inline in the Query', function () {
    describe('#max', function () {
      const queryOk = /* GraphQL */`
        query {
            books(size: 3) {
                title
            }
        }
      `
      const queryFailing = /* GraphQL */`
        query {
            books(size: 100) {
              title
            }
        }
      `

      before(async function () {
        this.typeDefs = /* GraphQL */`
          type Query {
              books (size: Int @constraint(max: 3)): [Book]
          }
          type Book {
              title: String
          }
      `

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryOk })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { books: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryFailing })

        strictEqual(statusCode, 400)
        // console.log(body.errors)
        strictEqual(body.errors[0].message,
          'Argument "size" of "books" got invalid value 100. Must be no greater than 3')
      })

      it('should throw custom error', async function () {
        const request = await setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryFailing })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be no greater than 3',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'size',
          context: [{ arg: 'max', value: 3 }]
        })
      })
    })
  })
}
