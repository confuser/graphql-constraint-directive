const { strictEqual } = require('assert')
const { getIntrospectionQuery } = require('graphql')
const setup = require('./setup')

describe('Introspection', function () {
  before(function () {
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
      title: String! @constraint(minLength: 3 maxLength: 5)
      subTitle: Int! @constraint(max: 3)
    }`

    this.request = setup(this.typeDefs)
  })

  it('should allow introspection', async function () {
    const { body, statusCode } = await this.request
      .post('/graphql')
      .set('Accept', 'application/json')
      .send({ query: getIntrospectionQuery() })

    strictEqual(statusCode, 200)

    const directive = body.data.__schema.directives.find(v => v.name === 'constraint')

    strictEqual(directive.args.length, 14)
  })
})
