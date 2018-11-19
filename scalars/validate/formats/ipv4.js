const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isIPv4 } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };

  return isIPv4(value) || validationError.format("ipv4", value);
};
