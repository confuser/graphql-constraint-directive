const { handleError } = require("./error");

function validate(name, args, value, opts = {}) {
  return new NumberValidator(name, args, value, opts).validate();
}

class NumberValidator {
  constructor(name, args, value, opts = {}) {
    const validationError = opts.validationError || handleError;
    this.validationError = validationError;
    this.name = name;
    this.args = args;
    this.value = value;
  }

  validate() {
    this.normalize();
    this.inRange();
    this.multipleOf();
    return true;
  }

  normalize() {
    const { args } = this;
    if (args.positive) {
      args.exclusiveMin = 0;
    }
    if (args.positive) {
      args.exclusiveMin = 0;
    }
    return this;
  }

  inRange() {
    this.min()
      .max()
      .exclusiveMin()
      .exclusiveMax();
  }

  min() {
    const { value, name, args, validationError } = this;
    if (args.min && value < args.min) {
      validationError.number(name, `Must be at least ${args.min}`, [
        { arg: "min", value: args.min }
      ]);
    }
    return this;
  }

  max() {
    const { value, name, args, validationError } = this;
    if (args.max && value > args.max) {
      validationError.number(name, `Must be no greater than ${args.max}`, [
        { arg: "max", value: args.max }
      ]);
    }
    return this;
  }

  exclusiveMin() {
    const { value, name, args, validationError } = this;
    if (args.exclusiveMin && value <= args.exclusiveMin) {
      validationError.number(
        name,
        `Must be greater than ${args.exclusiveMin}`,
        [{ arg: "exclusiveMin", value: args.exclusiveMin }]
      );
    }
    return this;
  }

  exclusiveMax() {
    const { value, name, args, validationError } = this;
    if (args.exclusiveMax && value >= args.exclusiveMax) {
      validationError.number(
        name,
        `Must be no greater than ${args.exclusiveMax}`,
        [{ arg: "exclusiveMax", value: args.exclusiveMax }]
      );
    }
    return this;
  }

  multipleOf() {
    const { value, name, args, validationError } = this;
    if (args.multipleOf && value % args.multipleOf !== 0) {
      validationError.number(name, `Must be a multiple of ${args.multipleOf}`, [
        { arg: "multipleOf", value: args.multipleOf }
      ]);
    }
    return this;
  }
}

module.exports = {
  validate,
  NumberValidator
};
