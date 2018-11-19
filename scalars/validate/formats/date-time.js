const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isDateTime } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isDateTime(value) || validationError.format("dateTime", value);
};
