const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')
const formatError = (error) => {
  const { message, code, fieldName, context } = error?.originalError?.originalError || error?.originalError || error
  return { message, code, fieldName, context }
}

describe('@constraint Int in ARGUMENT_DEFINITION', function () {
  describe('#max', function () {
    const query = /* GraphQL */`
        query ($size: size_Int_max_3) {
            books(size: $size) {
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
        .send({ query, variables: { size: 2 } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { size: 100 } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$size" got invalid value 100; Expected type "size_Int_max_3". Must be no greater than 3')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { size: 100 } })

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
