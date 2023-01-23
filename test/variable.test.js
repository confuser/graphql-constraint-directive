const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError } = require('./testutils')

module.exports.test = function (setup, implType) {
  const queryIntType = valueByImplType(implType, 'size_Int_max_3', 'Int')

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
          query ($size: ${queryIntType} = 3) {
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
          query ($size: ${queryIntType} = 4) {
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
  })
}
