const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError } = require('./testutils')

module.exports.test = function (setup, implType) {
  const queryIntMaxType = valueByImplType(implType, 'size_Int_max_3', 'Int')
  const queryIntMinType = valueByImplType(implType, 'size_Int_min_3', 'Int')
  const queryStringMinLengthType = valueByImplType(implType, 'search_String_minLength_3', 'String')

  describe('Variables', function () {
    describe('variable default value', function () {
      before(async function () {
        this.typeDefs = /* GraphQL */`
          type Query {
              books (size: Int @constraint(max: 3)): [Book]
          }
          type Book {
              title: String
          }
        `
        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const query = /* GraphQL */`
          query ($size: ${queryIntMaxType} = 3) {
            books(size: $size) {
                title
            }
        }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { books: null } })
      })

      it('should fail', async function () {
        const query = /* GraphQL */`
          query ($size: ${queryIntMaxType} = 4) {
            books(size: $size) {
                title
            }
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          valueByImplType(implType, 'Expected value of type "size_Int_max_3", found 4;', 'Variable "$size" got invalid value 4.') + ' Must be no greater than 3')
      })
    })

    describe('variable int falsy', function () {
      before(async function () {
        this.typeDefs = /* GraphQL */`
          type Query {
            books (size: Int @constraint(min: 3)): [Book]
          }
          type Book {
            title: String
          }
        `
        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const query = /* GraphQL */`
          query ($size: ${queryIntMinType} = 3) {
            books(size: $size) {
              title
            }
        }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { books: null } })
      })

      it('should fail', async function () {
        const query = /* GraphQL */`
          query ($size: ${queryIntMinType} = 0) {
            books(size: $size) {
              title
            }
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          valueByImplType(implType, 'Expected value of type "size_Int_min_3", found 0;', 'Variable "$size" got invalid value 0.') + ' Must be at least 3')
      })
    })

    describe('variable string falsy', function () {
      before(async function () {
        this.typeDefs = /* GraphQL */`
          type Query {
            books (search: String @constraint(minLength: 3)): [Book]
          }
          type Book {
            title: String
          }
        `
        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const query = /* GraphQL */`
          query ($search: ${queryStringMinLengthType} = "test") {
            books(search: $search) {
              title
            }
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { books: null } })
      })

      it('should fail - despite being falsy', async function () {
        const query = /* GraphQL */`
          query ($search: ${queryStringMinLengthType} = "") {
            books(search: $search) {
              title
            }
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          valueByImplType(implType, 'Expected value of type "search_String_minLength_3", found "";', 'Variable "$search" got invalid value "".') + ' Must be at least 3 characters in length')
      })
    })
  })
}
