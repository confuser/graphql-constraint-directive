const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isCreditCard } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isCreditCard(value) || validationError.format("creditCard", value);
};
