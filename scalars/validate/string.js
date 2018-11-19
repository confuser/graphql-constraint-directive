const formats = require("./formats");
const { handleError } = require("./error");

module.exports = function validate(name, args, value, opts = {}) {
  const validationError = opts.validationError || handleError;
  const { contains, isLength } = opts.validator;
  if (args.minLength && !isLength(value, { min: args.minLength })) {
    validationError.string(
      name,
      `Must be at least ${args.minLength} characters in length`,
      [{ arg: "minLength", value: args.minLength }]
    );
  }
  if (args.maxLength && !isLength(value, { max: args.maxLength })) {
    validationError.string(
      name,
      `Must be no more than ${args.maxLength} characters in length`,
      [{ arg: "maxLength", value: args.maxLength }]
    );
  }

  if (args.startsWith && !value.startsWith(args.startsWith)) {
    validationError.string(name, `Must start with ${args.startsWith}`, [
      { arg: "startsWith", value: args.startsWith }
    ]);
  }

  if (args.endsWith && !value.endsWith(args.endsWith)) {
    validationError.string(name, `Must end with ${args.endsWith}`, [
      { arg: "endsWith", value: args.endsWith }
    ]);
  }

  if (args.contains && !contains(value, args.contains)) {
    validationError.string(name, `Must contain ${args.contains}`, [
      { arg: "contains", value: args.contains }
    ]);
  }

  if (args.notContains && contains(value, args.notContains)) {
    validationError.string(name, `Must not contain ${args.notContains}`, [
      { arg: "notContains", value: args.notContains }
    ]);
  }

  if (args.pattern && !new RegExp(args.pattern).test(value)) {
    validationError.string(name, `Must match ${args.pattern}`, [
      { arg: "pattern", value: args.pattern }
    ]);
  }

  if (args.format) {
    const formatter = formats[args.format];

    if (!formatter) {
      validationError.string(name, `Invalid format type ${args.format}`, [
        { arg: "format", value: args.format }
      ]);
    }

    try {
      formatter(value, opts); // Will throw if invalid
    } catch (e) {
      validationError.string(name, e.message, [
        { arg: "format", value: args.format }
      ]);
    }
  }
};
