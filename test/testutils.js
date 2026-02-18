const { strictEqual, ok } = require('assert')

const formatError = (error) => {
  const { message, code, fieldName, context } = error?.originalError?.originalError || error?.originalError || error
  return { message, code, fieldName, context }
}

/**
 * Select value by implementation type - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType to select value by. Some of `IMPL_TYPE_xx` constants
 * @param {*} valueSchemaWrapper value returned for IMPL_TYPE_SCHEMA_WRAPPER
 * @param {*} valueServerValidator value returned for IMPL_TYPE_SERVER_VALIDATOR
 * @returns selected value
 */
function valueByImplType (implType, valueSchemaWrapper, valueServerValidator) {
  if (implType === IMPL_TYPE_SCHEMA_WRAPPER) { return valueSchemaWrapper } else { return valueServerValidator || '' }
}

/**
 * Checks if status code means error - depends on implType.
 *
 * @parem {*} statusCode to check
 * @param {*} implType to check status code for. Some of `IMPL_TYPE_xx` constants
 * @returns true if status code means error
 */
function isStatusCodeError (statusCode, implType) {
  if (implType === IMPL_TYPE_SERVER_VALIDATOR_ENVELOP) { strictEqual(statusCode, 200) } else { strictEqual(statusCode, 400) }
}

/**
 * Return true if implementation type is `IMPL_TYPE_SCHEMA_WRAPPER` - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType  to check
 * @returns true if `implType` is `IMPL_TYPE_SCHEMA_WRAPPER`
 */
function isSchemaWrapperImplType (implType) {
  return implType === IMPL_TYPE_SCHEMA_WRAPPER
}

/**
 * Return true if implementation type is `IMPL_TYPE_SERVER_VALIDATOR_APOLLO` - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType  to check
 * @returns true if `implType` is `IMPL_TYPE_SERVER_VALIDATOR_APOLLO`
 */
function isServerValidatorApollo (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_APOLLO
}

/**
 * Return true if implementation type is `IMPL_TYPE_SERVER_VALIDATOR_APOLLO4` - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType  to check
 * @returns true if `implType` is `IMPL_TYPE_SERVER_VALIDATOR_APOLLO4`
 */
function isServerValidatorApollo4 (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_APOLLO4
}

/**
 * Return true if implementation type is `IMPL_TYPE_SERVER_VALIDATOR_ENVELOP` - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType  to check
 * @returns true if `implType` is `IMPL_TYPE_SERVER_VALIDATOR_ENVELOP`
 */
function isServerValidatorEnvelop (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_ENVELOP
}

/**
 * Return true if implementation type is `IMPL_TYPE_SERVER_VALIDATOR_RULE` - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType  to check
 * @returns true if `implType` is `IMPL_TYPE_SERVER_VALIDATOR_RULE`
 */
function isServerValidatorRule (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_RULE
}

/**
 * Unwrap multiple validation errors, as some plugins wrap them into one error.
 *
 * @param {any[]} errors returned from query
 * @returns {any[]} unwrapped error
 */
function unwrapMoreValidationErrors (errors) {
  if (errors && errors.length === 1 && errors[0]?.extensions?.validationErrors) {
    strictEqual(errors[0].message, 'Query is invalid, for details see extensions.validationErrors')
    return errors[0].extensions.validationErrors
  } else {
    return errors
  }
}

function isValidExtensionError (error, implType) {
  if (implType === IMPL_TYPE_SERVER_VALIDATOR_APOLLO) {
    strictEqual(error.extensions.code, 'BAD_USER_INPUT')
    strictEqual(error.extensions.field, 'input.title')
    strictEqual(error.extensions.context[0].arg, 'minLength')
    strictEqual(error.extensions.context[0].value, 3)
    ok(Array.isArray(error.extensions.exception.stacktrace))
    strictEqual(error.extensions.exception.stacktrace[0], 'UserInputError: Title must be at least 3 characters')
  } else if (implType === IMPL_TYPE_SERVER_VALIDATOR_APOLLO4) {
    strictEqual(error.extensions.code, 'BAD_USER_INPUT')
    strictEqual(error.extensions.field, 'input.title')
    strictEqual(error.extensions.context[0].arg, 'minLength')
    strictEqual(error.extensions.context[0].value, 3)
    ok(Array.isArray(error.extensions.stacktrace))
    strictEqual(error.extensions.stacktrace[0], 'GraphQLError: Title must be at least 3 characters')
  } else if (implType === IMPL_TYPE_SERVER_VALIDATOR_ENVELOP) {
    strictEqual(error.extensions.code, 'ERR_GRAPHQL_CONSTRAINT_VALIDATION')
    strictEqual(error.extensions.field, 'input.title')
    strictEqual(error.extensions.context[0].arg, 'minLength')
    strictEqual(error.extensions.context[0].value, 3)
  } else if (implType === IMPL_TYPE_SERVER_VALIDATOR_RULE) {
    strictEqual(error.extensions.code, 'ERR_GRAPHQL_CONSTRAINT_VALIDATION')
    strictEqual(error.extensions.field, 'input.title')
    strictEqual(error.extensions.context[0].arg, 'minLength')
    strictEqual(error.extensions.context[0].value, 3)
    ok(Array.isArray(error.extensions.exception.stacktrace))
  } else if (implType === IMPL_TYPE_SCHEMA_WRAPPER) {
    strictEqual(error.extensions.code, 'BAD_USER_INPUT')
    ok(Array.isArray(error.extensions.exception.stacktrace))
    strictEqual(error.extensions.exception.stacktrace[0], 'ConstraintDirectiveError: Title must be at least 3 characters')
  } else {
    throw new Error(`Implementation type not supported: ${implType}`)
  }
}
const IMPL_TYPE_SERVER_VALIDATOR_APOLLO = 'serverValidatorApollo'
const IMPL_TYPE_SERVER_VALIDATOR_APOLLO4 = 'serverValidatorApollo4'
const IMPL_TYPE_SERVER_VALIDATOR_ENVELOP = 'serverValidatorEnvelop'
const IMPL_TYPE_SERVER_VALIDATOR_RULE = 'serverValidatorRule'
const IMPL_TYPE_SCHEMA_WRAPPER = 'schemaWrapper'

module.exports = {
  IMPL_TYPE_SCHEMA_WRAPPER,
  IMPL_TYPE_SERVER_VALIDATOR_APOLLO,
  IMPL_TYPE_SERVER_VALIDATOR_APOLLO4,
  IMPL_TYPE_SERVER_VALIDATOR_ENVELOP,
  IMPL_TYPE_SERVER_VALIDATOR_RULE,
  isStatusCodeError,
  valueByImplType,
  isSchemaWrapperImplType,
  isServerValidatorApollo,
  isServerValidatorApollo4,
  isServerValidatorEnvelop,
  isServerValidatorRule,
  formatError,
  unwrapMoreValidationErrors,
  isValidExtensionError
}
