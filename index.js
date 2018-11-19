const {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean
} = require("graphql");
const { SchemaDirectiveVisitor } = require("graphql-tools");
const ConstraintStringType = require("./scalars/string");
const ConstraintNumberType = require("./scalars/number");
const $validator = require("validator");

// wrap your own validator using the same API
const validator = {
  isLength: $validator.isLength,
  contains: $validator.contains,
  isDateTime: $validator.isRFC3339,
  isDate: $validator.isISO8601,
  isIPv6: value => $validator.isIP(value, 6),
  isIPv4: value => $validator.isIP(value, 4),
  isEmail: $validator.isEmail,
  isByte: $validator.isBase64,
  isUri: $validator.isURL,
  isUUID: $validator.isUUID
};

class ConstraintDirective extends SchemaDirectiveVisitor {
  constructor(config) {
    super(config);
    const context = config.context || {};
    this.validator = context.validator || validator;
  }

  static getDirectiveDeclaration(directiveName) {
    return new GraphQLDirective({
      name: directiveName,
      locations: [DirectiveLocation.INPUT_FIELD_DEFINITION],
      args: {
        /* Strings */
        minLength: { type: GraphQLInt },
        maxLength: { type: GraphQLInt },
        startsWith: { type: GraphQLString },
        endsWith: { type: GraphQLString },
        contains: { type: GraphQLString },
        notContains: { type: GraphQLString },
        pattern: { type: GraphQLString },
        format: { type: GraphQLString },

        /* Numbers (Int/Float) */
        positive: { type: GraphQLBoolean },
        negative: { type: GraphQLBoolean },
        min: { type: GraphQLFloat },
        max: { type: GraphQLFloat },
        exclusiveMin: { type: GraphQLFloat },
        exclusiveMax: { type: GraphQLFloat },
        multipleOf: { type: GraphQLFloat }
      }
    });
  }

  // visitInputObject(object) {
  //   this.objTypeName = object.name;
  //   this.fields = object.getFields();
  // }

  // We could likely set which type of complex type is currently being visited
  // then the scalars for that complex type can be validated as a whole
  // when leaf visitors are done and returns to parent visitor
  visitInputFieldDefinition(field) {
    this.wrapType(field);
  }

  createConstraintStringType({ name, type, validator }) {
    return new ConstraintStringType({ name, type, validator }, this.args);
  }

  createConstraintNumberType({ name, type, validator }) {
    return new ConstraintNumberType({ name, type, validator }, this.args);
  }

  // TODO: extract into class
  wrapType(field) {
    const fieldName = field.astNode.name.value;
    const { type } = field;
    const { ofType } = type;
    const { fields, objTypeName } = this;
    const opts = {
      name: fieldName,
      field,
      fields,
      objTypeName,
      type,
      ofType,
      validator: this.validator
    };

    this.wrapNonNullString(opts) ||
      this.wrapString(opts) ||
      this.wrapNonNullNumber(opts) ||
      this.wrapNumber(opts) ||
      this.notScalarError(type);
  }

  // wrapList(opts) {
  //   const { type, ofType, field } = opts;
  //   if (type instanceof GraphQLList) {
  //     // validate list
  //     new GraphQLList(this.createConstraintListType(opts));
  //   }
  // }

  // createConstraintListType(opts = {}) {
  //   return new ConstraintListType(opts);
  // }

  // TODO
  wrapListString(opts = {}) {
    const { type, ofType } = opts;
    if (type instanceof GraphQLList && ofType === GraphQLString) {
      // validate
    }
  }

  // TODO
  wrapListNumber(opts = {}) {
    const { type, ofType } = opts;
    if (type instanceof GraphQLList && ofType === GraphQLNumber) {
      // validate
    }
  }

  wrapNonNullString(opts = {}) {
    const { type, ofType, field } = opts;
    if (type instanceof GraphQLNonNull && ofType === GraphQLString) {
      field.type = new GraphQLNonNull(
        this.createConstraintStringType({ ...opts, type: ofType })
      );
      return true;
    }
  }

  wrapString(opts = {}) {
    const { type, field } = opts;
    if (type === GraphQLString) {
      field.type = this.createConstraintStringType({ ...opts, type });
      return true;
    }
  }

  wrapNonNullNumber(opts = {}) {
    const { type, ofType, field } = opts;
    if (
      type instanceof GraphQLNonNull &&
      (ofType === GraphQLFloat || ofType === GraphQLInt)
    ) {
      field.type = new GraphQLNonNull(
        this.createConstraintNumberType({ ...opts, type: ofType })
      );
      return true;
    }
  }

  wrapNumber(opts = {}) {
    const { type, field } = opts;
    if (type === GraphQLFloat || type === GraphQLInt) {
      field.type = this.createConstraintNumberType(opts);
      return true;
    }
  }

  notScalarError(type) {
    throw new Error(`Not a scalar type: ${type}`);
  }
}

module.exports = ConstraintDirective;
