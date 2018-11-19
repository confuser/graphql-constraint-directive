const ConstraintBaseType = require("./base");

module.exports = class ConstraintStringType extends ConstraintBaseType {
  constructor({ name, type, validator }, args) {
    super(
      {
        name,
        type,
        typeName: "string",
        className: "ConstraintString",
        validator
      },
      args
    );
  }
};
