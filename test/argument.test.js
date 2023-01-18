const { deepStrictEqual, strictEqual } = require('assert')
const { formatError, valueByImplType, isSchemaWrapperImplType, isStatusCodeError, unwrapMoreValidationErrors } = require('./testutils')

module.exports.test = function (setup, implType) {
  const queryIntType = valueByImplType(implType, 'size_Int_max_3', 'Int')
  const query2IntType = valueByImplType(implType, 'size_Int_max_4', 'Int')

  describe('@constraint in ARGUMENT_DEFINITION', function () {
    describe('Values provided over variables', function () {
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
        this.request = await setup({ typeDefs: this.typeDefs })
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

        // console.log('Body: ' + JSON.stringify(body))
        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$size" got invalid value 100' + valueByImplType(implType, '; Expected type "size_Int_max_3"') + '. Must be no greater than 3')
      })

      it('should fail - deeper nesting', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryDeeper, variables: { size: 5 } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$size" got invalid value 5' + valueByImplType(implType, '; Expected type "size_Int_max_4"') + '. Must be no greater than 4')
      })

      it('should fail - more errors', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryTwoVariables, variables: { size: 4, sizeAuthors: 5 } })

        // console.log(body)
        isStatusCodeError(statusCode, implType)
        const errors = unwrapMoreValidationErrors(body.errors)
        strictEqual(errors[0].message,
          'Variable "$size" got invalid value 4' + valueByImplType(implType, '; Expected type "size_Int_max_3"') + '. Must be no greater than 3')
        strictEqual(errors[1].message,
          'Variable "$sizeAuthors" got invalid value 5' + valueByImplType(implType, '; Expected type "size_Int_max_4"') + '. Must be no greater than 4')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query: queryTwoVariables, variables: { size: 100, sizeAuthors: 5 } })

          strictEqual(statusCode, 400)
          deepStrictEqual(body.errors[0], {
            message: 'Must be no greater than 3',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'size',
            context: [{ arg: 'max', value: 3 }]
          })
          deepStrictEqual(body.errors[1], {
            message: 'Must be no greater than 4',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: valueByImplType(implType, 'size', 'sizeAuthors'),
            context: [{ arg: 'max', value: 4 }]
          })
        })
      }
    })

    describe('Values inlined in the query', function () {
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
              books (size: Int! @constraint(max: 3)): [Book]
              book: Book
          }
          type Book {
              title: String
              authors (size: Int @constraint(max: 4)): [String]
          }
        `

        this.request = await setup({ typeDefs: this.typeDefs })
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

        isStatusCodeError(statusCode, implType)
        // console.log(body.errors)
        strictEqual(body.errors[0].message,
          valueByImplType(implType,
            'Expected value of type "size_Int_NotNull_max_3!", found 100; Must be no greater than 3',
            'Argument "size" of "books" got invalid value 100. Must be no greater than 3')
        )
      })

      it('should fail - deeper nesting', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryDeeperFailing })

        isStatusCodeError(statusCode, implType)
        // console.log(body.errors)
        strictEqual(body.errors[0].message,
          valueByImplType(implType,
            'Expected value of type "size_Int_max_4", found 5; Must be no greater than 4',
            'Argument "size" of "authors" got invalid value 5. Must be no greater than 4'))
      })

      it('should fail - more errors', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryFailingTwoTimes })

        // console.log(body)
        isStatusCodeError(statusCode, implType)
        const errors = unwrapMoreValidationErrors(body.errors)
        strictEqual(errors[0].message,
          valueByImplType(implType,
            'Expected value of type "size_Int_NotNull_max_3!", found 100; Must be no greater than 3',
            'Argument "size" of "books" got invalid value 100. Must be no greater than 3')
        )
        strictEqual(errors[1].message,
          valueByImplType(implType,
            'Expected value of type "size_Int_max_4", found 5; Must be no greater than 4',
            'Argument "size" of "authors" got invalid value 5. Must be no greater than 4')
        )
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query: queryFailingTwoTimes })

          strictEqual(statusCode, 400)
          deepStrictEqual(body.errors[0], {
            message: 'Must be no greater than 3',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: valueByImplType(implType, 'size', 'books.size'),
            context: [{ arg: 'max', value: 3 }]
          })
          deepStrictEqual(body.errors[1], {
            message: 'Must be no greater than 4',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: valueByImplType(implType, 'size', 'authors.size'),
            context: [{ arg: 'max', value: 4 }]
          })
        })
      }
    })
  })
}
