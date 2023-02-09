const { strictEqual } = require('assert')

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
  unwrapMoreValidationErrors
}
