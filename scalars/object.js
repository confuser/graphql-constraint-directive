const { GraphQLObjectType } = require("graphql");

module.exports = class ConstraintListType extends GraphQLObjectType {
  constructor(opts, args) {
    super(opts);
    this.args = args;
  }

  getFields() {
    return super.getFields();
  }
};
