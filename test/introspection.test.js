const { strictEqual, notEqual } = require('assert')
const { getIntrospectionQuery } = require('graphql')
const { isSchemaWrapperImplType } = require('./testutils')

module.exports.test = function (setup, implType) {
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

      this.request = await setup({ typeDefs: this.typeDefs })
    })

    it('should allow introspection', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query: getIntrospectionQuery() })

      strictEqual(statusCode, 200)
      const directive = body.data.__schema.directives.find(v => v.name === 'constraint')
      strictEqual(directive.args.length, 16)

      // `uniqueTypeName` not used in the server validator based implementation
      const type = body.data.__schema.types.find(t => t.name === 'BookInput_subTitle')
      if (isSchemaWrapperImplType(implType)) {
        notEqual(type, null)
      } else {
        strictEqual(type, undefined)
      }
    })

    if (isSchemaWrapperImplType(implType)) {
      // Test not applicable to the server validator based implementation as `uniqueTypeName` is not used here
      it('should allow unique type names to be added', async function () {
        const { body } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query: getIntrospectionQuery() })

        const type = body.data.__schema.types.find(t => t.name === 'BookInput_subTitle')
        notEqual(type, null)
      })
    }
  })
}
