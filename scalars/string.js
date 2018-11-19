const ConstraintScalarType = require("./scalar");

module.exports = class ConstraintStringType extends ConstraintScalarType {
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
