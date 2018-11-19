const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isUUID } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isUUID(value) || validationError.format("uuid", value);
};
