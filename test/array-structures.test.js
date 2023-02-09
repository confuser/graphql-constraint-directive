const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError, unwrapMoreValidationErrors } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('Array structures', function () {
    describe('INPUT_OBJECT', function () {
      const query = /* GraphQL */`
        mutation createBook($input: BookInput) {
          createBook(input: $input) {
            title
          }
        }
      `

      describe('simple type', function () {
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
              title: [Int!]! @constraint(min: 3)
            }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: [3, 4] } } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: [2, 5] } } })

          isStatusCodeError(statusCode, implType)
          strictEqual(
            body.errors[0].message,
            'Variable "$input" got invalid value 2 at "input.title[0]"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            '. Must be at least 3'
          )
        })
      })

      describe('input object', function () {
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
            authors: [AuthorInput!]!
          }
          input AuthorInput {
            name: String! @constraint(maxLength: 5)
            age: [Int!]! @constraint(min: 3)
          }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { authors: [{ name: 'asdsd', age: [5, 7] }, { name: 'fdgt', age: [6, 5] }] } } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { authors: [{ name: 'asdsdd', age: [5, 2] }, { name: 'fdgt', age: [1, 5] }] } } })

          // console.log(body)
          isStatusCodeError(statusCode, implType)
          const errors = unwrapMoreValidationErrors(body.errors)
          strictEqual(
            errors[0].message,
            'Variable "$input" got invalid value "asdsdd" at "input.authors[0].name"' +
            valueByImplType(implType, '; Expected type "name_String_NotNull_maxLength_5"') +
            '. Must be no more than 5 characters in length'
          )
          strictEqual(
            errors[1].message,
            'Variable "$input" got invalid value 2 at "input.authors[0].age[1]"' +
            valueByImplType(implType, '; Expected type "age_List_ListNotNull_Int_NotNull_min_3"') +
            '. Must be at least 3'
          )
          strictEqual(
            errors[2].message,
            'Variable "$input" got invalid value 1 at "input.authors[1].age[0]"' +
            valueByImplType(implType, '; Expected type "age_List_ListNotNull_Int_NotNull_min_3"') +
            '. Must be at least 3'
          )
        })
      })

      describe('input object - inlined', function () {
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
            authors: [AuthorInput!]!
          }
          input AuthorInput {
            name: String! @constraint(maxLength: 5)
            age: [Int!]! @constraint(min: 3)
          }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = /* GraphQL */`
            mutation {
              createBook(input: {
                authors: [{ name: "asdsd", age: [5, 7] }, { name: "fdgt", age: [6, 5] }] 
              }) {
                title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const query = `mutation {
            createBook(input: {
              authors: [{ name: "asdsdd", age: [5, 2] }, { name: "fdgt", age: [1, 5] }] 
            }) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          const errors = unwrapMoreValidationErrors(body.errors)
          strictEqual(
            errors[0].message,
            valueByImplType(implType, 'Expected value of type "name_String_NotNull_maxLength_5!", found "asdsdd";',
              'Argument "input" of "createBook" got invalid value "asdsdd" at "authors[0].name".') +
            ' Must be no more than 5 characters in length'
          )
          strictEqual(
            errors[1].message,
            valueByImplType(implType, 'Expected value of type "age_List_ListNotNull_Int_NotNull_min_3!", found 2;',
              'Argument "input" of "createBook" got invalid value 2 at "authors[0].age[1]".') +
            ' Must be at least 3'
          )
          strictEqual(
            errors[2].message,
            valueByImplType(implType, 'Expected value of type "age_List_ListNotNull_Int_NotNull_min_3!", found 1;',
              'Argument "input" of "createBook" got invalid value 1 at "authors[1].age[0]".') +
            ' Must be at least 3'
          )
        })
      })
    })

    describe('Argument', function () {
      describe('simple type', function () {
        const type = valueByImplType(implType, 'input_List_ListNotNull_Int_NotNull_min_3', 'Int')
        const query = `mutation createBook($input: [${type}!]!) {
          createBook(input: $input) {
            title
          }
        }`

        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [Int!]! @constraint(min: 3)): Book
          }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: [3, 4] } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: [2, 5] } })

          isStatusCodeError(statusCode, implType)
          strictEqual(
            body.errors[0].message,
            'Variable "$input" got invalid value 2 at "input[0]"' +
            valueByImplType(implType, '; Expected type "input_List_ListNotNull_Int_NotNull_min_3"') +
            '. Must be at least 3'
          )
        })
      })

      describe('simple type - inlined', function () {
        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [Int!]! @constraint(min: 3)): Book
          }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = `mutation createBook {
            createBook(input: [3, 4]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const query = `mutation createBook {
            createBook(input: [2, 5]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          strictEqual(
            body.errors[0].message,
            valueByImplType(implType, 'Expected value of type "input_List_ListNotNull_Int_NotNull_min_3!", found 2;',
              'Argument "input" of "createBook" got invalid value 2 at "[0]".') +
            ' Must be at least 3'
          )
        })
      })

      describe('input object', function () {
        const query = `mutation createBook($input: [BookInput!]!) {
          createBook(input: $input) {
            title
          }
        }`

        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [BookInput!]! ): Book
          }
          input BookInput {
            title: String! @constraint(maxLength: 5)
            authors: [AuthorInput!]!
          }
          input AuthorInput {
            name: String! @constraint(maxLength: 5)
          }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: [{ title: 'asdfr', authors: [{ name: 'dfgds' }, { name: 'ytyuy' }] }, { title: 'hgfgh', authors: [{ name: 'rertf' }] }] } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: [{ title: 'asdfrs', authors: [{ name: 'dfgds' }, { name: 'ytyuyd' }] }, { title: 'hgfgh', authors: [{ name: 'rertfs' }] }] } })

          // console.log(body)
          isStatusCodeError(statusCode, implType)
          const errors = unwrapMoreValidationErrors(body.errors)
          strictEqual(
            errors[0].message,
            'Variable "$input" got invalid value "asdfrs" at "input[0].title"' +
            valueByImplType(implType, '; Expected type "title_String_NotNull_maxLength_5"') +
            '. Must be no more than 5 characters in length'
          )
        })
      })

      describe('input object - inlined', function () {
        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [BookInput!]! ): Book
          }
          input BookInput {
            title: String! @constraint(maxLength: 5)
            authors: [AuthorInput!]!
          }
          input AuthorInput {
            name: String! @constraint(maxLength: 5)
          }
          `

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = `mutation createBook {
            createBook(input: [{ title: "asdfr", authors: [{ name: "dfgds" }, { name: "ytyuy" }] }, { title: "hgfgh", authors: [{ name: "rertf" }] }]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const query = `mutation createBook {
            createBook(input: [{ title: "asdfrs", authors: [{ name: "dfgds" }, { name: "ytyuyd" }] }, { title: "hgfgh", authors: [{ name: "rertfs" }] }]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          // console.log(body)
          isStatusCodeError(statusCode, implType)
          const errors = unwrapMoreValidationErrors(body.errors)
          strictEqual(
            errors[0].message,
            valueByImplType(implType, 'Expected value of type "title_String_NotNull_maxLength_5!", found "asdfrs";',
              'Argument "input" of "createBook" got invalid value "asdfrs" at "[0].title".') +
            ' Must be no more than 5 characters in length'
          )
        })
      })
    })
  })
}
