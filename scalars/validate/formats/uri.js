const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isUri } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isUri(value) || validationError.format("uri", value);
};
