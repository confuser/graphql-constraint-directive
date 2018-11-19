const ConstraintBaseType = require("./base");

module.exports = class ConstraintNumberType extends ConstraintBaseType {
  constructor({ name, type }, args) {
    super(
      {
        name,
        type,
        typeName: "number",
        className: "ConstraintNumber"
      },
      args
    );
  }
};
