const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isDate } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isDate(value) || validationError.format("date", value);
};
