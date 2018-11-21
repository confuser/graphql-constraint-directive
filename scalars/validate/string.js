const formats = require("./formats");
const { handleError } = require("./error");

export function validate(name, args, value, opts = {}) {
  return new StringValidator(name, args, value, opts).validate();
}

class StringValidator {
  constructor(name, args, value, opts = {}) {
    const validationError = opts.validationError || handleError;
    const { contains, isLength } = opts.validator;
    this.contains = contains;
    this.isLength = isLength;
    this.validationError = validationError;
    this.validator = opts.validator;
    this.name = name;
    this.args = args;
    this.value = value;
  }

  validate() {
    this.minLength()
      .maxLength()
      .startsWith()
      .endsWith()
      .containsText()
      .notContainsText()
      .pattern()
      .format();
    return true;
  }

  minLength() {
    const { value, name, args, validationError, isLength } = this;
    if (args.minLength && !isLength(value, { min: args.minLength })) {
      validationError.string(
        name,
        `Must be at least ${args.minLength} characters in length`,
        [{ arg: "minLength", value: args.minLength }]
      );
    }
    return this;
  }

  maxLength() {
    const { value, name, args, validationError, isLength } = this;
    if (args.maxLength && !isLength(value, { max: args.maxLength })) {
      validationError.string(
        name,
        `Must be no more than ${args.maxLength} characters in length`,
        [{ arg: "maxLength", value: args.maxLength }]
      );
    }
    return this;
  }

  startsWith() {
    const { value, name, args, validationError } = this;
    if (args.startsWith && !value.startsWith(args.startsWith)) {
      validationError.string(name, `Must start with ${args.startsWith}`, [
        { arg: "startsWith", value: args.startsWith }
      ]);
    }
    return this;
  }

  endsWith() {
    const { value, name, args, validationError } = this;
    if (args.endsWith && !value.endsWith(args.endsWith)) {
      validationError.string(name, `Must end with ${args.endsWith}`, [
        { arg: "endsWith", value: args.endsWith }
      ]);
    }
    return this;
  }

  containsText() {
    const { value, name, args, validationError, contains } = this;
    if (args.contains && !contains(value, args.contains)) {
      validationError.string(name, `Must contain ${args.contains}`, [
        { arg: "contains", value: args.contains }
      ]);
    }
    return this;
  }

  notContainsText() {
    const { value, name, args, validationError, contains } = this;
    if (args.notContains && contains(value, args.notContains)) {
      validationError.string(name, `Must not contain ${args.notContains}`, [
        { arg: "notContains", value: args.notContains }
      ]);
    }
    return this;
  }

  pattern() {
    const { value, name, args, validationError } = this;
    if (args.pattern && !new RegExp(args.pattern).test(value)) {
      validationError.string(name, `Must match ${args.pattern}`, [
        { arg: "pattern", value: args.pattern }
      ]);
    }
    return this;
  }

  format() {
    const { value, name, args, validationError, validator } = this;
    const { format } = args;
    if (format) {
      const formatter = formats[format];

      if (!formatter) {
        validationError.string(name, `Invalid format type ${format}`, [
          { arg: "format", value: format }
        ]);
      }

      try {
        const opts = { validationError, validator };

        formatter(value, opts); // Will throw if invalid
      } catch (e) {
        validationError.string(name, e.message, [
          { arg: "format", value: format }
        ]);
      }
    }
    return this;
  }
}

module.exports = {
  validate,
  StringValidator
};
