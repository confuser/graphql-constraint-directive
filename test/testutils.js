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
 * Return true if implementation type is `IMPL_TYPE_SCHEMA_WRAPPER` - usefull for tests which need to vary based on implementation type.
 *
 * @param {*} implType  to check
 * @returns true if `implType` is `IMPL_TYPE_SCHEMA_WRAPPER`
 */
function isSchemaWrapperImplType (implType) {
  return implType === IMPL_TYPE_SCHEMA_WRAPPER
}

function isServerValidator (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR
}

function isServerValidatorRule (implType) {
  return implType === IMPL_TYPE_SERVER_VALIDATOR_RULE
}

const IMPL_TYPE_SERVER_VALIDATOR = 'serverValidator'
const IMPL_TYPE_SERVER_VALIDATOR_RULE = 'serverValidatorRule'
const IMPL_TYPE_SCHEMA_WRAPPER = 'schemaWrapper'

module.exports = {
  IMPL_TYPE_SCHEMA_WRAPPER,
  IMPL_TYPE_SERVER_VALIDATOR,
  IMPL_TYPE_SERVER_VALIDATOR_RULE,
  valueByImplType,
  isSchemaWrapperImplType,
  isServerValidator,
  isServerValidatorRule,
  formatError
}
