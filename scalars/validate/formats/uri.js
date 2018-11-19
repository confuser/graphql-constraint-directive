const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isUri } = opts.validator;
  const validationError = opts.validationError || formatError;
  return isUri(value) || validationError.format("uri", value);
};
