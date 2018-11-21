const { GraphQLList } = require("graphql");

module.exports = class ConstraintListType extends ConstraintScalarType {
  constructor({ name, type, validator }, args) {
    super(
      {
        name,
        type,
        typeName: "list",
        className: "ConstraintList",
        validator
      },
      args
    );
  }
};
