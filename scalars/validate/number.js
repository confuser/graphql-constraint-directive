const { handleError } = require("./error");

module.exports = function validate(name, args, value, opts = {}) {
  const validationError = opts.validationError || handleError;
  if (args.min && value < args.min) {
    validationError.number(name, `Must be at least ${args.min}`, [
      { arg: "min", value: args.min }
    ]);
  }
  if (args.max && value > args.max) {
    validationError.number(name, `Must be no greater than ${args.max}`, [
      { arg: "max", value: args.max }
    ]);
  }

  if (args.exclusiveMin && value <= args.exclusiveMin) {
    validationError.number(name, `Must be greater than ${args.exclusiveMin}`, [
      { arg: "exclusiveMin", value: args.exclusiveMin }
    ]);
  }
  if (args.exclusiveMax && value >= args.exclusiveMax) {
    validationError.number(
      name,
      `Must be no greater than ${args.exclusiveMax}`,
      [{ arg: "exclusiveMax", value: args.exclusiveMax }]
    );
  }

  if (args.multipleOf && value % args.multipleOf !== 0) {
    validationError.number(name, `Must be a multiple of ${args.multipleOf}`, [
      { arg: "multipleOf", value: args.multipleOf }
    ]);
  }
};
