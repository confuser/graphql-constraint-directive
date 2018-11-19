const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isByte } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isByte(value) || validationError.format("byte", value);
};
