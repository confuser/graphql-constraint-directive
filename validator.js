const validator = require("validator");

const wrappedValidator = {
  // wrap your own validator using the same API
  isLength: validator.isLength,
  contains: validator.contains,
  isAlpha: validator.isAlpha,
  isAlphanumeric: validator.isAlphanumeric,
  isCreditCard: validator.isCreditCard,
  isDateTime: validator.isRFC3339,
  isDate: validator.isISO8601,
  isIPv6: value => validator.isIP(value, 6),
  isIPv4: value => validator.isIP(value, 4),
  isEmail: validator.isEmail,
  isByte: validator.isBase64,
  isUri: validator.isURL,
  isUUID: validator.isUUID
};

module.exports = wrappedValidator;
