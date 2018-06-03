module.exports = class ConstraintDirectiveError extends Error {
  constructor (fieldName, message, context) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)

    this.code = 'ERR_GRAPHQL_CONSTRAINT_VALIDATION'
    this.fieldName = fieldName
    this.context = context
  }
}
