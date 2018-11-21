const { GraphQLScalarType } = require("graphql");
const validate = require("./validate");

module.exports = class ConstraintScalarType extends GraphQLScalarType {
  constructor({ name, className, typeName, type, validator }, args) {
    super({
      name: className,
      serialize(value) {
        return type.serialize(value);
      },
      parseValue(value) {
        values = type.serialize(value);

        validate[typeName](name, args, values, { validator });

        return type.parseValue(values);
      },
      parseLiteral(ast) {
        const values = type.parseLiteral(ast);

        validate[typeName](name, args, values, { validator });

        return values;
      }
    });
  }
};
