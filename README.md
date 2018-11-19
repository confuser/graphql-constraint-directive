# graphql-constraint-directive

[![Build Status](https://api.travis-ci.org/confuser/graphql-constraint-directive.svg?branch=master)](https://travis-ci.org/confuser/graphql-constraint-directive)
[![Coverage Status](https://coveralls.io/repos/github/confuser/graphql-constraint-directive/badge.svg?branch=master)](https://coveralls.io/github/confuser/graphql-constraint-directive?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/confuser/graphql-constraint-directive/badge.svg?targetFile=package.json)](https://snyk.io/test/github/confuser/graphql-constraint-directive?targetFile=package.json)

Allows using @constraint as a directive to validate input data. Inspired by [Constraints Directives RFC](https://github.com/APIs-guru/graphql-constraints-spec) and OpenAPI

## Install

```
npm install graphql-constraint-directive
```

## Usage

```js
const ConstraintDirective = require("graphql-constraint-directive");
const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const typeDefs = `
  type Query {
    books: [Book]
  }
  type Book {
    title: String
  }
  type Mutation {
    createBook(input: BookInput): Book
  }
  input BookInput {
    title: String! @constraint(minLength: 5, format: "email")
  }`;
const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: { constraint: ConstraintDirective }
});
const app = express();

app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
```

## API

### String

#### minLength

`@constraint(minLength: 5)`
Restrict to a minimum length

#### maxLength

`@constraint(maxLength: 5)`
Restrict to a maximum length

#### startsWith

`@constraint(startsWith: "foo")`
Ensure value starts with foo

#### endsWith

`@constraint(endsWith: "foo")`
Ensure value ends with foo

#### contains

`@constraint(contains: "foo")`
Ensure value contains foo

#### notContains

`@constraint(notContains: "foo")`
Ensure value does not contain foo

#### pattern

`@constraint(pattern: "^[0-9a-zA-Z]*$")`
Ensure value matches regex, e.g. alphanumeric

#### format

`@constraint(format: "email")`
Ensure value is in a particular format

Supported formats:

- byte: Base64
- date-time: RFC 3339
- date: ISO 8601
- email
- ipv4
- ipv6
- uri
- uuid

### Int/Float

#### min

`@constraint(min: 3)`
Ensure value is greater than or equal to

#### max

`@constraint(max: 3)`
Ensure value is less than or equal to

#### exclusiveMin

`@constraint(exclusiveMin: 3)`
Ensure value is greater than

#### exclusiveMax

`@constraint(exclusiveMax: 3)`
Ensure value is less than

#### multipleOf

`@constraint(multipleOf: 10)`
Ensure value is a multiple

### ConstraintDirectiveError

Each validation error throws a `ConstraintDirectiveError`. Combined with a formatError function, this can be used to customise error messages.

```js
{
  code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
  fieldName: 'theFieldName',
  context: [ { arg: 'argument name which failed', value: 'value of argument' } ]
}
```

```js
const formatError = function(error) {
  if (
    error.originalError &&
    error.originalError.code === "ERR_GRAPHQL_CONSTRAINT_VALIDATION"
  ) {
    // return a custom object
  }

  return error;
};

app.use("/graphql", bodyParser.json(), graphqlExpress({ schema, formatError }));
```

## Customization

By default, the constraint directive uses [validator.js](https://www.npmjs.com/package/validator)
You can pass your own `validator` in the GraphQL context object, conforming to this API:

- `isLength(value)`
- `contains(value)`
- `isDateTime(value)`
- `isDate(value)`
- `isIPv6(value)`
- `isIPv4(value)`
- `isEmail(value)`
- `isByte(value)`
- `isUri(value)`
- `isUUID(value)`

Note: All the above methods expect value to be a string.

The default validator is wrapped as follows:

```js
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
```

### Validation messages

You can set a `validationError` function map on the GraphQL context object to provide your own validator error handlers.

- `format(key, value)`
- `string(name, msg, args[])
- `number(name, msg, args[])

The format validators will call: `validationError.format('date', value)`

The `string` and `number` validators will call the error handler like this:

```js
validationError.string(name, `Must match ${args.pattern}`, [
  { arg: "pattern", value: args.pattern }
]);
```

Note that the third argument contains a list where each object has an `arg` entry that indicates the constraint that failed. You can use this as a key to lookup in your own validation error message map to return or output a localized error message as you see fit.

## Validating Complex types

### Object

Validate:

- Two fields must have same value (password, confirmedPassword) ie. `same`
- When one field is set to sth, another field can only have specific set of values (ie. `when`)

We can use `Yup` for full object validation

When visiting an object, we could keep perhaps track of the fields contained within.
Then we continually check off each field being visited, setting parsed value on `fieldNameValueMap` . When all fields for the object have been "checked off", we call a callback to do full object validation on all parsed values collected.

Example: Yup object validation

```js
visitInputObject(object) {
  const objValidator = createObjectValidator(object)
  this.stack.push(objValidator)
}

class ObjectValidator {
  constructor(object) {
    this.objTypeName = object.name;
    this.object = object
    const fields = object.getFields();
    this.fields = fields
    this.fieldNames = Object.keys(fields)
    this.fieldNameValueMap = {}
  }

  get shape() {
    return this.fieldNames.reduce((acc, name) => {
      const { field, fieldType, value } = this.fieldNameValueMap[name]
      const fieldSchema = yup[fieldType]()
      acc[name] = fieldSchema
      return acc
    }, {})
  }

  get schema() {
    return yup.object().shape(this.shape)
  }

  validate() {
    // validate all fields of object in fieldNameValueMap
    return this.schema.validate()
  }
}
```

For it to work "for real", we need to push each such validator on a stack so that each field uses the one at the top of the stack. Then when done validating, remove it from the stack...

Pretty complicated, but should be possible!

### Lists

Validate:

- Number of items in list
- Particular items allowed in list
- ...

Lists are defined as modifiers on other types. We should be able to at least validate lists of `String`, `Int` and `Float` for starters.

A schema definition like: `type: [User!]!` would result in:

`type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User)))`

```js
  // TODO
  wrapListString(opts = {}) {
    const { type, ofType } = opts;
    if (type instanceof GraphQLList && ofType === GraphQLString) {
      // validate?
    }
  }

  // TODO
  wrapListNumber(opts = {}) {
    const { type, ofType } = opts;
    if (type instanceof GraphQLList && ofType === GraphQLNumber) {
      // validate?
    }
  }
```

A scalar has a `parseValue` function which returns a `ValueNode` from a `Source`:

```ts
export type ValueNode =
  | VariableNode
  | IntValueNode
  | FloatValueNode
  | StringValueNode
  | BooleanValueNode
  | NullValueNode
  | EnumValueNode
  | ListValueNode
  | ObjectValueNode;
```

As we can see, such a value can be a `ListValueNode`:

```ts
export interface ListValueNode {
  readonly kind: "ListValue";
  readonly loc?: Location;
  readonly values: ReadonlyArray<ValueNode>;
}
```

For an object return value

```ts
export interface ObjectValueNode {
  readonly kind: "ObjectValue";
  readonly loc?: Location;
  readonly fields: ReadonlyArray<ObjectFieldNode>;
}
```

with fields:

```ts
export interface ObjectFieldNode {
  readonly kind: "ObjectField";
  readonly loc?: Location;
  readonly name: NameNode;
  readonly value: ValueNode;
}
```

## Resources

- [GraphQL List - How to use arrays in GraphQL schema (GraphQL Modifiers)](https://graphqlmastery.com/blog/graphql-list-how-to-use-arrays-in-graphql-schema)
- [Deep dive into GraphQL type system](https://github.com/mugli/learning-graphql/blob/master/7.%20Deep%20Dive%20into%20GraphQL%20Type%20System.md)
- [Life of a GraphQL Query — Validation](https://medium.com/@cjoudrey/life-of-a-graphql-query-validation-18a8fb52f189)
- [Graphql validated types](https://www.npmjs.com/package/graphql-validated-types)
