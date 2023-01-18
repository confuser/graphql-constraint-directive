const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError, unwrapMoreValidationErrors } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('Inline Fragment', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
            search: [Result]
        }
        type Book {
            title: String
            authors(max: Int @constraint(min: 5)): [String]
        }
        type Magazine {
            title: String
            volume(min: Int @constraint(min: 4)): Int
        }
        union Result = Book | Magazine
      `

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    describe('Inlined value', function () {
      it('should pass', async function () {
        const query = /* GraphQL */`
          query search {
            search {
              ... on Book {
                title
                authors(max: 6)
              }
              ... on Magazine {
                title
                volume(min: 4)
              }
            }
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        // console.log(body)
        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { search: null } })
      })

      it('should fail', async function () {
        const query = /* GraphQL */`
          query search {
            search {
              ... on Book {
                title
                authors(max: 4)
              }
              ... on Magazine {
                title
                volume(min: 3)
              }
            }
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        // console.log(body)
        isStatusCodeError(statusCode, implType)
        const errors = unwrapMoreValidationErrors(body.errors)
        strictEqual(
          errors[0].message,
          valueByImplType(implType, 'Expected value of type "max_Int_min_5", found 4;', 'Argument "max" of "authors" got invalid value 4.') +
          ' Must be at least 5'
        )
        strictEqual(
          errors[1].message,
          valueByImplType(implType, 'Expected value of type "min_Int_min_4", found 3;', 'Argument "min" of "volume" got invalid value 3.') +
          ' Must be at least 4'
        )
      })
    })

    describe('Variables', function () {
      const queryIntType = valueByImplType(implType, 'max_Int_min_5', 'Int')
      const query2IntType = valueByImplType(implType, 'min_Int_min_4', 'Int')

      const query = /* GraphQL */`
          query search($arg1: ${queryIntType} , $arg2: ${query2IntType}) {
            search {
              ... on Book {
                title
                authors(max: $arg1)
              }
              ... on Magazine {
                title
                volume(min: $arg2)
              }
            }
          }
        `
      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { arg1: 5, arg2: 4 } })

        // console.log(body)
        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { search: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { arg1: 4, arg2: 3 } })

        // console.log(body)
        isStatusCodeError(statusCode, implType)
        const errors = unwrapMoreValidationErrors(body.errors)
        strictEqual(
          errors[0].message,
          'Variable "$arg1" got invalid value 4' +
          valueByImplType(implType, '; Expected type "max_Int_min_5"') +
          '. Must be at least 5'
        )
        strictEqual(
          errors[1].message,
          'Variable "$arg2" got invalid value 3' +
          valueByImplType(implType, '; Expected type "min_Int_min_4"') +
          '. Must be at least 4'
        )
      })
    })
  })
}
