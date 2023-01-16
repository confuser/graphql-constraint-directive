const { strictEqual } = require('assert')
const { GraphQLString } = require('graphql')
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils')

const dateDirectiveTypeDefs = 'directive @formatDate on FIELD_DEFINITION'

const dateDirectiveTransformer = (schema) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD] (fieldConfig) {
      const dateDirective = getDirective(schema, fieldConfig, 'formatDate')?.[0]
      if (dateDirective) {
        fieldConfig.args.format = {
          type: GraphQLString
        }

        fieldConfig.type = GraphQLString
        return fieldConfig
      }
    }
  })

module.exports.test = function (setup, implType) {
  describe('Dynamic argument', function () {
    before(async function () {
      this.typeDefs = /* GraphQL */`
        type Query {
            getBook: String @formatDate
            getBooks: [String] @formatDate
        }
      ` + '\n' + dateDirectiveTypeDefs

      this.request = await setup({ typeDefs: this.typeDefs, schemaCreatedCallback: (schema) => { return dateDirectiveTransformer(schema) } })
    })

    it('should pass', async function () {
      const query = /* GraphQL */`
          query Go {
            getBook(format: "aa")
            getBooks(format: "aa")
          }

        `
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      if (statusCode !== 200) { console.log(body) }
      strictEqual(statusCode, 200)
    })
  })
}
