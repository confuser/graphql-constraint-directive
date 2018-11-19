const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isIPv6 } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isIPv6(value) || validationError.format("ipv6", value);
};
