const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isEmail } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isEmail(value) || validationError.format("email", value);
};
