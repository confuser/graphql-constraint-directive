const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')

describe('Array', function () {
  describe('Int', function () {
    const query = `mutation createBook($input: BookInput) {
        createBook(input: $input) {
          title
        }
      }`

    describe('#min', function () {
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
            title: [Int!]! @constraint(min: 3)
          }`

        this.request = await setup(this.typeDefs)
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

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value [2, 5] at "input.title"; Expected type "title_List_ListNotNull_Int_NotNull_min_3". Must be at least 3'
        )
      })
    })
    describe('#max', function () {
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
            title: [Int!] @constraint(max: 3)
          }`

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: [1, 2] } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: [1, 4] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value [1, 4] at "input.title"; Expected type "title_List_Int_NotNull_max_3". Must be no greater than 3'
        )
      })
    })

    describe('#notNull', function () {
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
            title: [Int!] @constraint(multipleOf: 2)
          }`

        this.request = await setup(this.typeDefs)
      })

      it('should fail with null', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: [2, null] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value [2, null] at "input.title"; Expected type "title_List_Int_NotNull_multipleOf_2". Must not contain null or undefined values'
        )
      })

      it('should fail with undefined', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: [undefined] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value [null] at "input.title"; Expected type "title_List_Int_NotNull_multipleOf_2". Must not contain null or undefined values'
        )
      })
    })
  })

  describe('String', function () {
    const query = `mutation createBook($input: BookInput) {
        createBook(input: $input) {
          title
        }
      }`
    describe('#minListLength', function () {
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
              title: [String!] @constraint(minListLength: 3)
            }`

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['he💩', 'test', '123'] } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['asdfa', 'a💩'] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value ["asdfa", "a💩"] at "input.title"; Expected type "title_List_String_NotNull_minListLength_3". Must be at least 3 elements in array'
        )
      })
    })

    describe('#maxListLength', function () {
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
              title: [String!]! @constraint(maxListLength: 3)
            }`

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['a💩', 'null'] } } })
        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['pu', 'fob💩', '123', '456'] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value ["pu", "fob💩", "123", "456"] at "input.title"; Expected type "title_List_ListNotNull_String_NotNull_maxListLength_3". Must be no more than 3 elements in array'
        )
      })
    })

    describe('#minLength', function () {
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
            title: [String!] @constraint(minLength: 3)
          }`

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['he💩', 'test'] } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['asdfa', 'a💩'] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value ["asdfa", "a💩"] at "input.title"; Expected type "title_List_String_NotNull_minLength_3". Must be at least 3 characters in length'
        )
      })
    })

    describe('#maxLength', function () {
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
            title: [String] @constraint(maxLength: 3)
          }`

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['a💩', '1'] } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: ['pu', 'fob💩'] } } })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value ["pu", "fob💩"] at "input.title"; Expected type "title_List_String_maxLength_3". Must be no more than 3 characters in length'
        )
      })
    })

    describe('#uri', function () {
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
            title: [String!]! @constraint(format: "uri")
          }`

        this.request = await setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query,
            variables: {
              input: { title: ['foobar.com', 'foobar.xyz', 'https://foobar.com'] }
            }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query,
            variables: { input: { title: ['foobar.com', 'a'] } }
          })

        strictEqual(statusCode, 400)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value ["foobar.com", "a"] at "input.title"; Expected type "title_List_ListNotNull_String_NotNull_format_uri". Must be in URI format'
        )
      })
    })
  })
})
