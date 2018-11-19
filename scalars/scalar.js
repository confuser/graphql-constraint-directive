const { GraphQLScalarType } = require("graphql");
const validate = require("./validate");

module.exports = class ConstraintScalarType extends GraphQLScalarType {
  constructor({ name, value, className, typeName, type, validator }, args) {
    super({
      name: className,
      serialize(value) {
        return type.serialize(value);
      },
      parseValue(value) {
        value = type.serialize(value);

        validate[typeName](name, args, value, { validator });

        return type.parseValue(value);
      },
      parseLiteral(ast) {
        const value = type.parseLiteral(ast);

        validate[typeName](name, args, value, { validator });

        return value;
      }
    });
  }
};
