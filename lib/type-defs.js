const {
  GraphQLString,
  GraphQLDirective,
  DirectiveLocation,
  GraphQLInt,
  GraphQLFloat
} = require('graphql')

const constraintDirectiveTypeDefs = /* GraphQL */`
  directive @constraint(
    # String constraints
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    contains: String
    notContains: String
    pattern: String
    format: String

    # Number constraints
    min: Float
    max: Float
    exclusiveMin: Float
    exclusiveMax: Float
    multipleOf: Float

    # Array/List size constraints
    minItems: Int
    maxItems: Int

    # Shared for Schema wrapper
    uniqueTypeName: String

  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION`

const constraintDirectiveTypeDefsObj = new GraphQLDirective({
  name: 'constraint',
  locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION],
  args: {

    // String constraint
    minLength: {
      type: GraphQLInt
    },
    maxLength: {
      type: GraphQLInt
    },
    startsWith: {
      type: GraphQLString
    },
    endsWith: {
      type: GraphQLString
    },
    contains: {
      type: GraphQLString
    },
    notContains: {
      type: GraphQLString
    },
    pattern: {
      type: GraphQLString
    },
    format: {
      type: GraphQLString
    },

    // Number constraint
    min: {
      type: GraphQLFloat
    },
    max: {
      type: GraphQLFloat
    },
    exclusiveMin: {
      type: GraphQLFloat
    },
    exclusiveMax: {
      type: GraphQLFloat
    },
    multipleOf: {
      type: GraphQLFloat
    },

    // Array/List size constraints
    minItems: {
      type: GraphQLInt
    },
    maxItems: {
      type: GraphQLInt
    },

    // Shared for Schema wrapper
    uniqueTypeName: {
      type: GraphQLString
    }

  }
})

module.exports = { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj }
