const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isByte } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };

  return isByte(value) || validationError.format("byte", value);
};
