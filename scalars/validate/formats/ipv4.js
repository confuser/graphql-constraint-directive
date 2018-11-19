const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isIPv4 } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isIPv4(value) || validationError.format("ipv4", value);
};
