const { deepStrictEqual, strictEqual } = require('assert')
const { formatError } = require('./testutils')

exports.test = function (setup, implType) {
  describe('@constraint Int in ARGUMENT_DEFINITION with value inline in the Query', function () {
    describe('#max', function () {
      const queryOk = /* GraphQL */`
        query Books {
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

      const queryDeeperOk = /* GraphQL */`
        query {
            book {
                title
                authors(size: 4)
            }
        }
      `

      const queryDeeperFailing = /* GraphQL */`
        query {
            book {
                title
                authors(size: 5)
            }
        }
      `

      const queryFailingTwoTimes = /* GraphQL */`
        query {
            books(size: 100) {
              title
              authors(size: 5)
            }
        }
      `

      before(async function () {
        this.typeDefs = /* GraphQL */`
          type Query {
              books (size: Int @constraint(max: 3)): [Book]
              book: Book
          }
          type Book {
              title: String
              authors (size: Int @constraint(max: 4)): [String]
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

      it('should pass - deeper nesting', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryDeeperOk })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { book: null } })
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

      it('should fail - deeper nesting', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryDeeperFailing })

        strictEqual(statusCode, 400)
        // console.log(body.errors)
        strictEqual(body.errors[0].message,
          'Argument "size" of "authors" got invalid value 5. Must be no greater than 4')
      })

      it('should fail - more errors', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryFailingTwoTimes })

        strictEqual(statusCode, 400)
        // console.log(body.errors)
        strictEqual(body.errors[0].message,
          'Argument "size" of "books" got invalid value 100. Must be no greater than 3')
        strictEqual(body.errors[1].message,
          'Argument "size" of "authors" got invalid value 5. Must be no greater than 4')
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
