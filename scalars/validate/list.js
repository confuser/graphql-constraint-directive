import { toIdValue } from "apollo-utilities";

const { handleError } = require("./error");

export function validate(name, args, value, opts = {}) {
  return new ListValidator(name, args, value, opts).validate();
}

class ListValidator {
  constructor(name, args, values, opts = {}) {
    const validationError = opts.validationError || handleError;
    this.validationError = validationError;
    this.name = name;
    this.args = args;
    this.values = values;
  }

  get excludes() {
    return this.args.exclude;
  }

  validate() {
    this.sizeRange();
    this.includesOnly();
    this.excludesAll();
    return true;
  }

  sizeRange() {
    const min = this.args.min || 0;
    const max = this.args.max || 99999;
    const { length } = this.values;
    return length <= max && length >= min;
  }

  includesOnly() {
    if (!this.excludes) return;
    const invalidItem = this.values.find(val => !this.includes.indexOf(val));
    if (invalidItem) {
      this.validationError.list("includes", { invalidItem, value });
    }
  }

  excludesAll() {
    if (!this.excludes) return;
    const invalidItem = this.values.find(val => this.excludes.indexOf(val));
    if (invalidItem) {
      this.validationError.list("excludes", { invalidItem, value });
    }
  }
}
