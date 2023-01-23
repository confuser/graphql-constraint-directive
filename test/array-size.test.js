const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('Array size', function () {
    describe('Inside Input Object', function () {
      const query = `mutation createBook($input: BookInput) {
        createBook(input: $input) {
          title
        }
      }`

      describe('#minItems', function () {
        before(async function () {
          this.typeDefs = `
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
            title: [Int!] @constraint(minItems: 3)
          }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: [3, 4, 5] } } })

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
            'Variable "$input" at "input.title"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            ' must be at least 3 in length'
          )
        })

        it('should fail - value not provided', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: null } } })

          isStatusCodeError(statusCode, implType)
          strictEqual(
            body.errors[0].message,
            'Variable "$input" at "input.title"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            ' must be at least 3 in length'
          )
        })
      })

      describe('#maxItems', function () {
        before(async function () {
          this.typeDefs = `
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
            title: [Int!] @constraint(maxItems: 2)
          }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: [1, 2] } } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should pass - value not provided', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: null } } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: [1, 4, 8] } } })

          isStatusCodeError(statusCode, implType)
          strictEqual(
            body.errors[0].message,
            'Variable "$input" at "input.title"' +
            valueByImplType(implType, '; Expected type "title_List_Int_NotNull_max_3"') +
            ' must be no more than 2 in length'
          )
        })
      })
    })

    describe('Scalar argument', function () {
      describe('#minItems', function () {
        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [Int] @constraint(minItems: 3)): Book
          }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = `mutation createBook {
            createBook(input: [2,3,4]) {
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
            createBook(input: [2,3]) {
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
            'Argument "input" of "createBook"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            ' must be at least 3 in length'
          )
        })

        it('should fail - value not provided', async function () {
          const query = `mutation createBook {
            createBook(input: null) {
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
            'Argument "input" of "createBook"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            ' must be at least 3 in length'
          )
        })
      })

      describe('#maxItems', function () {
        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [Int] @constraint(maxItems: 2, max: 100)): Book
          }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = `mutation createBook {
            createBook(input: [2,3]) {
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

        it('should pass - value not provided', async function () {
          const query = `mutation createBook {
            createBook(input: null) {
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
            createBook(input: [2,3,7]) {
              title
            }
          }`

          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors.length, 1)
          strictEqual(
            body.errors[0].message,
            'Argument "input" of "createBook"' +
            valueByImplType(implType, '; Expected type "title_List_Int_NotNull_max_3"') +
            ' must be no more than 2 in length'
          )
        })

        it('should fail - another scalar validation', async function () {
          const query = `mutation createBook {
            createBook(input: [2, 101]) {
              title
            }
          }`

          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors.length, 1)
          strictEqual(
            body.errors[0].message,
            'Argument "input" of "createBook" got invalid value 101 at "[1]"' +
            valueByImplType(implType, '; Expected type "title_List_Int_NotNull_max_3"') +
            '. Must be no greater than 100'
          )
        })
      })
    })

    describe('Scalar argument of ID type', function () {
      describe('#minItems', function () {
        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [ID]! @constraint(minItems: 3)): Book
          }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = `mutation createBook {
            createBook(input: ["2","3","4"]) {
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
            createBook(input: ["2","3"]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors.length, 1)
          strictEqual(
            body.errors[0].message,
            'Argument "input" of "createBook"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            ' must be at least 3 in length'
          )
        })
      })
    })

    describe('InputObject argument', function () {
      describe('#minItems', function () {
        before(async function () {
          this.typeDefs = `
          type Query {
            books: [Book]
          }
          type Book {
            title: String
          }
          type Mutation {
            createBook(input: [BookInput]! @constraint(minItems: 3)): Book
          }
          input BookInput {
            title: String @constraint(maxLength: 2)
          }
          `
          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const query = `mutation createBook {
            createBook(input: [{title:"aa"},{title:"ab"},{title:"ba"}]) {
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
            createBook(input: [{title:"aa"},{title:"ab"}]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors.length, 1)
          strictEqual(
            body.errors[0].message,
            'Argument "input" of "createBook"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            ' must be at least 3 in length'
          )
        })

        it('should fail - another validation in input object', async function () {
          const query = `mutation createBook {
            createBook(input: [{title:"aa"},{title:"abc"},{title:"as"}]) {
              title
            }
          }`
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors.length, 1)
          strictEqual(
            body.errors[0].message,
            'Argument "input" of "createBook" got invalid value "abc" at "[1].title"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"') +
            '. Must be no more than 2 characters in length'
          )
        })
      })
    })
  })
}
