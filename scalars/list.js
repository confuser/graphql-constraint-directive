const { GraphQLList } = require("graphql");

module.exports = class ConstraintListType extends GraphQLList {
  constructor(type, args) {
    super(type);
    this.args = args;
  }
};
