const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isAlpha } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };

  return isAlpha(value) || validationError.format("alpha", value);
};
