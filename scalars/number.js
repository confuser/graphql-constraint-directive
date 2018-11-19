const ConstraintScalarType = require("./scalar");

module.exports = class ConstraintNumberType extends ConstraintScalarType {
  constructor({ name, type, validator }, args) {
    super(
      {
        name,
        type,
        typeName: "number",
        className: "ConstraintNumber",
        validator
      },
      args
    );
  }
};
