const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, isStatusCodeError } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('Union', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
            items: [ResultUnion]
        }
        
        union ResultUnion = Book | Magazine

        type Book {
            title: String
            authors(max: Int @constraint(min: 5)): [String]
        }

        type Magazine {
            name: String
            authors(max: Int @constraint(min: 5)): [String]
        }
      `

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    describe('Inlined value', function () {
      it('should pass', async function () {
        const query = /* GraphQL */`
          query GetItems {
            items {
              ... on Book {
                title
                authors(max: 6)
              }
              ... on Magazine {
                name
                authors(max: 6)
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
        deepStrictEqual(body, { data: { items: null } })
      })

      it('should pass with __typename', async function () {
        const query = /* GraphQL */`
          query GetItems {
            items {
              __typename
              ... on Book {
                title
                authors(max: 6)
              }
              ... on Magazine {
                name
                authors(max: 6)
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
        deepStrictEqual(body, { data: { items: null } })
      })

      it('should fail', async function () {
        const query = /* GraphQL */`
          query GetItems {
            items {
              ... on Book {
                title
                authors(max: 4)
              }
              ... on Magazine {
                name
                authors(max: 6)
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
        strictEqual(
          body.errors[0].message,
          valueByImplType(implType, 'Expected value of type "max_Int_min_5", found 4;', 'Argument "max" of "authors" got invalid value 4.') +
          ' Must be at least 5'
        )
      })

      it('should fail with __typename', async function () {
        const query = /* GraphQL */`
          query GetItems {
            items {
              __typename
              ... on Book {
                title
                authors(max: 4)
              }
              ... on Magazine {
                name
                authors(max: 6)
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
        strictEqual(
          body.errors[0].message,
          valueByImplType(implType, 'Expected value of type "max_Int_min_5", found 4;', 'Argument "max" of "authors" got invalid value 4.') +
          ' Must be at least 5'
        )
      })
    })
  })
}
