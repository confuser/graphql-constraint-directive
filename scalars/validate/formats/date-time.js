const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isDateTime } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };

  return isDateTime(value) || validationError.format("dateTime", value);
};
