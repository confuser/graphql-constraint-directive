const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isDate } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isDate(value) || validationError.format("date", value);
};
