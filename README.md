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
