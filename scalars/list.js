const ValidationError = require('../lib/error')
module.exports = function listValidate (fieldName, args, value, isNotNull) {
  if (
    args.minListLength &&
    !(Array.isArray(value) && value.length >= args.minListLength)
  ) {
    throw new ValidationError(
      fieldName,
      `Must be at least ${args.minListLength} elements in array`,
      [{ arg: 'minListLength', value: args.minListLength }]
    )
  }
  if (
    args.maxListLength &&
    !(Array.isArray(value) && value.length <= args.maxListLength)
  ) {
    throw new ValidationError(
      fieldName,
      `Must be no more than ${args.maxListLength} elements in array`,
      [{ arg: 'maxListLength', value: args.maxListLength }]
    )
  }
  if (isNotNull === true && value.some((item) => item === null || item === undefined)) {
    throw new ValidationError(
      fieldName,
      'Must not contain null or undefined values',
      [{ arg: 'isNotNull', value: true }]
    )
  }
}
