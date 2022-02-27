const { strictEqual, notEqual } = require('assert')
const { getIntrospectionQuery } = require('graphql')
const setup = require('./setup')

describe('Introspection', function () {
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
      title: String! @constraint(minLength: 3 maxLength: 5)
      subTitle: Int! @constraint(max: 3, uniqueTypeName: "BookInput_subTitle")
    }`

    this.request = await setup(this.typeDefs)
  })

  it('should allow introspection', async function () {
    const { body, statusCode } = await this.request
      .post('/graphql')
      .set('Accept', 'application/json')
      .send({ query: getIntrospectionQuery() })

    strictEqual(statusCode, 200)
    const directive = body.data.__schema.directives.find(v => v.name === 'constraint')
    strictEqual(directive.args.length, 14)

    const type = body.data.__schema.types.find(t => t.name === 'BookInput_subTitle')
    notEqual(type, null)
  })
  it('should allow unique type names to be added', async function () {
    const { body } = await this.request
      .post('/graphql')
      .set('Accept', 'application/json')
      .send({ query: getIntrospectionQuery() })

    const type = body.data.__schema.types.find(t => t.name === 'BookInput_subTitle')
    notEqual(type, null)
  })
})
