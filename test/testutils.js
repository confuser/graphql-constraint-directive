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

function isServerValidatorApollo (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_APOLLO
}

function isServerValidatorEnvelop (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_ENVELOP
}

function isServerValidatorRule (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_RULE
}

const IMPL_TYPE_SERVER_VALIDATOR_APOLLO = 'serverValidatorApollo'
const IMPL_TYPE_SERVER_VALIDATOR_ENVELOP = 'serverValidatorEnvelop'
const IMPL_TYPE_SERVER_VALIDATOR_RULE = 'serverValidatorRule'
const IMPL_TYPE_SCHEMA_WRAPPER = 'schemaWrapper'

module.exports = {
  IMPL_TYPE_SCHEMA_WRAPPER,
  IMPL_TYPE_SERVER_VALIDATOR_APOLLO,
  IMPL_TYPE_SERVER_VALIDATOR_ENVELOP,
  IMPL_TYPE_SERVER_VALIDATOR_RULE,
  isStatusCodeError,
  valueByImplType,
  isSchemaWrapperImplType,
  isServerValidatorApollo,
  isServerValidatorEnvelop,
  isServerValidatorRule,
  formatError
}
