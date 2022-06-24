const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, formatError } = require('./testutils')

exports.test = function (setup, implType) {
  // const queryIntType = valueByImplType(implType, 'title_Int_NotNull_min_3', 'Int')

  describe('@constraint in INPUT_OBJECT', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
          books: [Book]
        }
        type Book {
          title: String
        }
        type Mutation {
          createBook(input: BookInput): Book
        }
        input BookInput {
          title: Int! @constraint(min: 3)
          author: AuthorInput
        }
        input AuthorInput {
          name: String! @constraint(minLength: 2)
        }
      `

      this.request = await setup(this.typeDefs)
    })

    describe('Values provided over variables', function () {
      const queryVariables = /* GraphQL */`
        mutation createBook($input: BookInput) {
          createBook(input: $input) {
            title
          }
        }
      `

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryVariables, variables: { input: { title: 3 } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should pass - nested objects', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryVariables, variables: { input: { title: 3, author: { name: 'aa' } } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryVariables, variables: { input: { title: 2 } } })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 2 at "input.title"' + valueByImplType(implType, '; Expected type "title_Int_NotNull_min_3"', '') + '. Must be at least 3')
      })

      it('should fail - nested objects', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryVariables, variables: { input: { title: 2, author: { name: 'a' } } } })

        strictEqual(statusCode, 400)
        strictEqual(body.errors.length, 2)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 2 at "input.title"' + valueByImplType(implType, '; Expected type "title_Int_NotNull_min_3"', '') + '. Must be at least 3')
        strictEqual(body.errors[1].message,
          'Variable "$input" got invalid value "a" at "input.author.name"' + valueByImplType(implType, '; Expected type "name_String_NotNull_minLength_2"', '') + '. Must be at least 2 characters in length')
      })

      it('should throw custom error', async function () {
        const request = await setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryVariables, variables: { input: { title: 2 } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be at least 3',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: valueByImplType(implType, 'title', 'input.title'),
          context: [{ arg: 'min', value: 3 }]
        })
      })
    })

    describe('Values inlined in the query', function () {
      const queryInlineOk = /* GraphQL */`
      mutation createBook {
        createBook(input: {title: 3}) {
          title
        }
      }
    `

      const queryInlineFail = /* GraphQL */`
      mutation createBook {
        createBook(input: {title: 2}) {
          title
        }
      }
    `

      const queryInlineFailNested = /* GraphQL */`
      mutation createBook {
        createBook(input: {title: 2, author: { name: "a" }}) {
          title
        }
      }
    `

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryInlineOk })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryInlineFail })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          valueByImplType(implType,
            'Expected value of type "title_Int_NotNull_min_3!", found 2; Must be at least 3',
            'Argument "input" of "createBook" got invalid value 2 at "title". Must be at least 3'))
      })

      it('should fail - nested object', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryInlineFailNested })

        // console.log(body)
        strictEqual(statusCode, 400)
        strictEqual(body.errors.length, 2)
        strictEqual(body.errors[0].message,
          valueByImplType(implType,
            'Expected value of type "title_Int_NotNull_min_3!", found 2; Must be at least 3',
            'Argument "input" of "createBook" got invalid value 2 at "title". Must be at least 3')
        )
        strictEqual(body.errors[1].message,
          valueByImplType(implType,
            'Expected value of type "name_String_NotNull_minLength_2!", found "a"; Must be at least 2 characters in length',
            'Argument "input" of "createBook" got invalid value "a" at "author.name". Must be at least 2 characters in length')
        )
      })

      it('should throw custom error', async function () {
        const request = await setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: queryInlineFailNested })

        strictEqual(statusCode, 400)
        strictEqual(body.errors.length, 2)
        deepStrictEqual(body.errors[0], {
          message: 'Must be at least 3',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: valueByImplType(implType, 'title', 'input.title'),
          context: [{ arg: 'min', value: 3 }]
        })
        deepStrictEqual(body.errors[1], {
          message: 'Must be at least 2 characters in length',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: valueByImplType(implType, 'name', 'input.author.name'),
          context: [{ arg: 'minLength', value: 2 }]
        })
      })
    })
  })
}
