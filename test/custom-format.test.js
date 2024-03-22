const { strictEqual, deepStrictEqual } = require('assert')
const { GraphQLError } = require('graphql')
const { isStatusCodeError, IMPL_TYPE_SERVER_VALIDATOR_APOLLO4 } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('Custom format', () => {
    let typeDefs
    let request
    const fooFormat = (value) => {
      if (typeof value === 'string' && value.toLowerCase().includes('foo')) {
        return true
      }
      throw new GraphQLError('No foos', {
        extensions: {
          code: 'BAD_USER_INPUT',
          http: {
            status: 400
          }
        }
      })
    }
    const createBookMutation = `
      mutation CreateBook($input: BookInput!) {
        createBook(input: $input) {
          title
          authors
        }
      }
    `

    describe('Array input', () => {
      before(async () => {
        typeDefs = `
          type Query {
            books: [Book!]
          }
          type Mutation {
            createBook(input: BookInput!): Book
          }
          type Book {
              title: String
              authors: [String!]
          }
          input BookInput {
            title: String!
            authors: [String!]! @constraint(format: "foo")
          }
        `
        request = await setup({ typeDefs, pluginOptions: { formats: { foo: fooFormat } } })
      })

      it('should pass', async () => {
        const variables = {
          input: {
            title: '1984',
            authors: ['Foo Orwell', 'Another Foo']
          }
        }
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: createBookMutation, variables })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async () => {
        const variables = {
          input: {
            title: 'The Metamorphosis',
            authors: ['Franz Kafka', 'Stanley Corngold']
          }
        }
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: createBookMutation, variables })

        isStatusCodeError(statusCode, implType)
        if (implType === IMPL_TYPE_SERVER_VALIDATOR_APOLLO4) {
          strictEqual(body.errors.length, 1)
          strictEqual(
            body.errors[0].extensions.validationErrors[0].message,
            'Variable "$input" got invalid value "Franz Kafka" at "input.authors[0]". No foos'
          )
          strictEqual(
            body.errors[0].extensions.validationErrors[1].message,
            'Variable "$input" got invalid value "Stanley Corngold" at "input.authors[1]". No foos'
          )
        } else {
          strictEqual(body.errors.length, 2)
          strictEqual(
            body.errors[0].message,
            'Variable "$input" got invalid value "Franz Kafka" at "input.authors[0]". No foos'
          )
          strictEqual(
            body.errors[1].message,
            'Variable "$input" got invalid value "Stanley Corngold" at "input.authors[1]". No foos'
          )
        }
      })
    })

    describe('Scalar input', () => {
      before(async () => {
        typeDefs = `
          type Query {
            books: [Book!]
          }
          type Mutation {
            createBook(input: BookInput!): Book
          }
          type Book {
              title: String
              authors: [String!]
          }
          input BookInput {
            title: String! @constraint(format: "foo")
            authors: [String!]!
          }
        `
        request = await setup({ typeDefs, pluginOptions: { formats: { foo: fooFormat } } })
      })

      it('should pass', async () => {
        const variables = {
          input: {
            title: 'Foos and Bars',
            authors: ['Tacitus Kilgore']
          }
        }
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: createBookMutation, variables })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async () => {
        const variables = {
          input: {
            title: '1984',
            authors: ['George Orwell']
          }
        }
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: createBookMutation, variables })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors.length, 1)
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value "1984" at "input.title". No foos'
        )
      })
    })
  })
}
