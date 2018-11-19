const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isUUID } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isUUID(value) || validationError.format("uuid", value);
};
