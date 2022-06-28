const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType } = require('./testutils')

exports.test = function (setup, implType) {
  describe('Array', function () {
    describe('INPUT_OBJECT', function () {
      const query = `mutation createBook($input: BookInput) {
        createBook(input: $input) {
          title
        }
      }`

      describe('simple type', function () {
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
            'Variable "$input" got invalid value 2 at "input.title[0]"' +
            valueByImplType(implType, '; Expected type "title_List_ListNotNull_Int_NotNull_min_3"', '') +
            '. Must be at least 3'
          )
        })
      })

      describe('nested object', function () {
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
            authors: [AuthorInput!]!
          }
          input AuthorInput {
            name: String! @constraint(maxLength: 5)
            age: [Int!]! @constraint(min: 3)
          }
          `

          this.request = await setup(this.typeDefs)
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
          strictEqual(statusCode, 400)
          strictEqual(
            body.errors[0].message,
            'Variable "$input" got invalid value "asdsdd" at "input.authors[0].name"' +
            valueByImplType(implType, '; Expected type "name_String_NotNull_maxLength_5"', '') +
            '. Must be no more than 5 characters in length'
          )
          strictEqual(
            body.errors[1].message,
            'Variable "$input" got invalid value 2 at "input.authors[0].age[1]"' +
            valueByImplType(implType, '; Expected type "age_List_ListNotNull_Int_NotNull_min_3"', '') +
            '. Must be at least 3'
          )
          strictEqual(
            body.errors[2].message,
            'Variable "$input" got invalid value 1 at "input.authors[1].age[0]"' +
            valueByImplType(implType, '; Expected type "age_List_ListNotNull_Int_NotNull_min_3"', '') +
            '. Must be at least 3'
          )
        })
      })
    })
  })
}
