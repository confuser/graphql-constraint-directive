const {
  TypeInfo,
  ValidationContext,
  visit,
  visitWithTypeInfo
} = require('graphql')
const QueryValidationVisitor = require('./query-validation-visitor.js')

function validateQuery (schema, query, variables, operationName, pluginOptions = {}) {
  const typeInfo = new TypeInfo(schema)

  const errors = []
  const context = new ValidationContext(
    schema,
    query,
    typeInfo,
    (error) => errors.push(error)
  )

  const visitor = new QueryValidationVisitor(context, {
    variables,
    operationName,
    pluginOptions
  })

  visit(query, visitWithTypeInfo(typeInfo, visitor))

  return errors
}

module.exports = { validateQuery }
