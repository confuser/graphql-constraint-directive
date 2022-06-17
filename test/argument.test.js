const { deepStrictEqual, strictEqual } = require('assert')
const { formatError, valueByImplType } = require('./testutils')

exports.test = function (setup, implType) {
  const queryIntType = valueByImplType(implType, 'size_Int_max_3', 'Int')
  const query2IntType = valueByImplType(implType, 'size_Int_max_4', 'Int')

  describe('@constraint Int in ARGUMENT_DEFINITION with value provided over Query variable', function () {
    describe('#max', function () {
      const query = /* GraphQL */`
        query ($size: ${queryIntType}) {
            books(size: $size) {
                title
            }
        }
      `

      const queryDeeper = /* GraphQL */`
        query ($size: ${query2IntType}) {
            book {
                title
                authors(size: $size)
            }
        }
      `

      const queryTwoVariables = /* GraphQL */`
        query ($size: ${queryIntType}, $sizeAuthors: ${query2IntType}) {
          books(size: $size) {
                title
                authors(size: $sizeAuthors)
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
          .send({ query, variables: { size: 2 } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { books: null } })
      })

      it('should pass - deeper nesting', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryDeeper, variables: { size: 4 } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { book: null } })
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

      it('should fail - deeper nesting', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryDeeper, variables: { size: 5 } })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$size" got invalid value 5' + valueByImplType(implType, '; Expected type "size_Int_max_4"', '') + '. Must be no greater than 4')
      })

      it('should fail - more errors', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryTwoVariables, variables: { size: 4, sizeAuthors: 5 } })

        // console.log(body)
        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$size" got invalid value 4' + valueByImplType(implType, '; Expected type "size_Int_max_3"', '') + '. Must be no greater than 3')
        strictEqual(body.errors[1].message,
          'Variable "$sizeAuthors" got invalid value 5' + valueByImplType(implType, '; Expected type "size_Int_max_4"', '') + '. Must be no greater than 4')
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
