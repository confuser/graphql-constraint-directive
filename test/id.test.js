const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('@constraint ID in INPUT_FIELD_DEFINITION treated like String', function () {
    const query = `mutation createBook($input: BookInput) {
      createBook(input: $input) {
        title
      }
    }`

    describe('#minLength', function () {
      before(async function () {
        this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: ID
      }
      type Mutation {
        createBook(input: BookInput): Book
      }
      input BookInput {
        title: ID! @constraint(minLength: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'he💩' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a💩' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a💩" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_minLength_3"') + '. Must be at least 3 characters in length')
      })

      it('should fail with empty id', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_minLength_3"') + '. Must be at least 3 characters in length')
      })
    })
  })
}
