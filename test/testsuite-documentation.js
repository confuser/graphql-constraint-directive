const { constraintDirectiveTypeDefs, constraintDirectiveDocumentation, constraintDirective } = require('..')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { GraphQLString, GraphQLObjectType, printSchema } = require('graphql')
const { equal } = require('assert')
const fs = require('fs')
const { mapSchema, MapperKind } = require('@graphql-tools/utils')

/**
 * If `true` schema data are refreshed in the storage, if `false` schema is compared with the data in the storage
 */
const REFRESH_SCHEMA_DATA = false

if (REFRESH_SCHEMA_DATA) { console.log('WARNING: Schema data are refreshed in the storage, no assertion occurs') }

function assertSchemaData (name, schema) {
  const fn = './test/snapshots/' + name + '.txt'
  const sd = printSchema(schema)
  if (REFRESH_SCHEMA_DATA) {
    fs.writeFileSync(fn, sd)
  } else {
    equal(sd, '' + fs.readFileSync(fn))
  }
}

describe('Schema Documentation', function () {
  const typeDefs = /* GraphQL */`

  type Query {
    """Query books field documented"""
    books (
      size: Int @constraint(max: 3, min: 1), 
      """ Query argument documented """
      first: String @constraint(minLength: 1) 
    ): [Book]
    """ Query book field documented """
    book: Book
  }
  type Book {
    title: String @constraint(maxLength: 10)
    """
    Book description already documented

    """
    description: String @constraint(
      minLength: 10, 
      maxLength: 50,
      uniqueTypeName: "MyString"
    )

    authors (
      """ 
      Book authors argument documented
      """
      size: Int @constraint(max: 4),
      """ 
      Already documented

      *Constraints:*
      * Minimal length as documented: 1
      """
      first: String @constraint(minLength: 1) 
    ): [String]
  }
  type Mutation {
    createBook(input: BookInput): Book
  }
  input BookInput {
    title: Int! @constraint(min: 3)
    author: AuthorInput
  }
  input AuthorInput {
    name: String! @constraint(minLength: 2)
  }
  `

  it('works - default options', async function () {
    let schema = makeExecutableSchema({
      typeDefs: [constraintDirectiveTypeDefs, typeDefs]
    })

    schema = constraintDirectiveDocumentation()(schema)

    assertSchemaData('ws-1', schema)
  })

  it('works - default options - modified schema', async function () {
    let schema = makeExecutableSchema({
      typeDefs: [constraintDirectiveTypeDefs, typeDefs]
    })

    schema = addFieldToSchema(schema)

    schema = constraintDirectiveDocumentation()(schema)

    assertSchemaData('ws-1-1', schema)
  })

  function addFieldToSchema (schema) {
    return mapSchema(schema, {
      [MapperKind.OBJECT_TYPE]: type => {
        if (type.name === 'Query') {
          const config = type.toConfig()
          config.fields.addedField = {
            type: GraphQLString,
            args: {}
          }
          return new GraphQLObjectType(config)
        }
      }
    })
  }

  it('works - customized options', async function () {
    let schema = makeExecutableSchema({
      typeDefs: [constraintDirectiveTypeDefs, typeDefs]
    })

    schema = constraintDirectiveDocumentation({
      header: 'My header:',
      descriptionsMap: {
        minLength: 'A Minimal length',
        maxLength: 'A Maximal length',
        startsWith: 'A Starts with',
        endsWith: 'A Ends with',
        contains: 'A Contains',
        notContains: 'A Doesn\'t contain',
        pattern: 'A Must match RegEx pattern',
        format: 'A Must match format',
        min: 'A Minimal value',
        max: 'A Maximal value',
        exclusiveMin: 'A Grater than',
        exclusiveMax: 'A Less than',
        multipleOf: 'A Must be a multiple of',
        minItems: 'A Minimal number of items',
        maxItems: 'A Maximal number of items'
      }
    })(schema)

    assertSchemaData('ws-2', schema)
  })

  it('works - customized header', async function () {
    let schema = makeExecutableSchema({
      typeDefs: [constraintDirectiveTypeDefs, typeDefs]
    })

    schema = constraintDirectiveDocumentation({
      header: 'My header:'
    })(schema)

    assertSchemaData('ws-2-2', schema)
  })

  it('works after wrapper impl transformation', async function () {
    let schema = makeExecutableSchema({
      typeDefs: [constraintDirectiveTypeDefs, typeDefs]
    })

    schema = constraintDirective()(schema)
    schema = constraintDirectiveDocumentation()(schema)

    assertSchemaData('ws-3', schema)
  })
})
