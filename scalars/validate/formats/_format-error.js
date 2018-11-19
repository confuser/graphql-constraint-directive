const { GraphQLError } = require("graphql/error");
const msgs = require("./_msgs");

module.exports = {
  format(key) {
    throw new GraphQLError(msgs[key] || `invalid ${key} format`);
  }
};
