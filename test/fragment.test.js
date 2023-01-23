const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('Fragment', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
            getBook: Book
        }
        type Book {
            title: String
            authors(max: Int @constraint(min: 5)): [String]
        }
      `

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    describe('Inlined value', function () {
      it('should pass', async function () {
        const query = /* GraphQL */`
          query Comparison {
            leftComparison: getBook {
              ...comparisonFileds
            }
            rightComparison: getBook {
              ...comparisonFileds
            }
          }

          fragment comparisonFileds on Book {
            title
            authors(max: 5)
          }
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        // console.log(body)
        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { leftComparison: null, rightComparison: null } })
      })

      it('should fail', async function () {
        const query = /* GraphQL */`
          query comparison {
            leftComparison: getBook {
              ...comparisonFileds
            }
            rightComparison: getBook {
              ...comparisonFileds
            }
          }
          fragment comparisonFileds on Book {
            title
            authors(max: 4)
          }
          
        `
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query })

        // console.log(body)
        isStatusCodeError(statusCode, implType)
        strictEqual(
          body.errors[0].message,
          valueByImplType(implType, 'Expected value of type "max_Int_min_5", found 4;', 'Argument "max" of "authors" got invalid value 4.') +
          ' Must be at least 5'
        )
      })
    })

    describe('Variables', function () {
      const queryIntType = valueByImplType(implType, 'max_Int_min_5', 'Int')

      const query = /* GraphQL */`
        query comparison($arg: ${queryIntType}) {
          leftComparison: getBook {
            ...comparisonFileds
          }
          rightComparison: getBook {
            ...comparisonFileds
          }
        }
        fragment comparisonFileds on Book {
          title
          authors(max: $arg)
        }
      `

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { arg: 5 } })

        // console.log(body)
        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { leftComparison: null, rightComparison: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { arg: 4 } })

        // console.log(JSON.stringify(body))
        isStatusCodeError(statusCode, implType)
        strictEqual(
          body.errors[0].message,
          'Variable "$arg" got invalid value 4' +
          valueByImplType(implType, '; Expected type "max_Int_min_5"') +
          '. Must be at least 5'
        )
      })
    })
  })
}
