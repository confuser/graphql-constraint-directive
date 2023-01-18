const {
  separateOperations,
  GraphQLError
} = require('graphql')
const { validateQuery } = require('./index')
const { constraintDirectiveTypeDefs } = require('./lib/type-defs')
const { gql } = require('graphql-tag')

function createApollo4QueryValidationPlugin ({ schema }) {
  return {
    async requestDidStart () {
      return ({
        async didResolveOperation (requestContext) {
          const { request, document } = requestContext
          const query = request.operationName
            ? separateOperations(document)[request.operationName]
            : document

          const errors = validateQuery(
            schema,
            query,
            request.variables,
            request.operationName
          )

          if (errors.length > 0) {
            const te = errors.map(err => {
              return new GraphQLError(err.message, {
                extensions: {
                  field: err.fieldName,
                  context: err.context,
                  code: 'BAD_USER_INPUT',
                  http: {
                    status: 400
                  }
                }
              })
            })
            if (te.length === 1) {
              throw te[0]
            } else {
              throw new GraphQLError('Query is invalid, for details see extensions.validationErrors', {
                extensions: {
                  code: 'BAD_USER_INPUT',
                  validationErrors: te,
                  http: {
                    status: 400
                  }
                }
              })
            }
          }
        }
      })
    }
  }
}

const constraintDirectiveTypeDefsGql = gql(constraintDirectiveTypeDefs)

module.exports = { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsGql, createApollo4QueryValidationPlugin }
