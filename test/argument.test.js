const { deepStrictEqual, strictEqual } = require('assert')
const { formatError, valueByImplType } = require('./testutils')

exports.test = function (setup, implType) {
  const queryIntType = valueByImplType(implType, 'size_Int_max_3', 'Int')

  describe('@constraint Int in ARGUMENT_DEFINITION with value provided over Query variable', function () {
    describe('#max', function () {
      const query = /* GraphQL */`
        query ($size: ${queryIntType}) {
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
          'Variable "$size" got invalid value 100' + valueByImplType(implType, '; Expected type "size_Int_max_3"', '') + '. Must be no greater than 3')
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
}
