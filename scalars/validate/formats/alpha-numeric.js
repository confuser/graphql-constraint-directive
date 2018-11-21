const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isAlphanumeric } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };

  return isAlphanumeric(value) || validationError.format("alphaNumeric", value);
};
