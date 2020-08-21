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
const { constraintDirective, constraintDirectiveTypeDefs } = require('graphql-constraint-directive')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
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
  }`
const schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
  schemaTransforms: [constraintDirective()]
})
const app = express()
const server = new ApolloServer({ schema })

server.applyMiddleware({ app })

```

## API
### String
#### minLength
```@constraint(minLength: 5)```
Restrict to a minimum length

#### maxLength
```@constraint(maxLength: 5)```
Restrict to a maximum length

#### startsWith
```@constraint(startsWith: "foo")```
Ensure value starts with foo

#### endsWith
```@constraint(endsWith: "foo")```
Ensure value ends with foo

#### contains
```@constraint(contains: "foo")```
Ensure value contains foo

#### notContains
```@constraint(notContains: "foo")```
Ensure value does not contain foo

#### pattern
```@constraint(pattern: "^[0-9a-zA-Z]*$")```
Ensure value matches regex, e.g. alphanumeric

#### format
```@constraint(format: "email")```
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
```@constraint(min: 3)```
Ensure value is greater than or equal to

#### max
```@constraint(max: 3)```
Ensure value is less than or equal to

#### exclusiveMin
```@constraint(exclusiveMin: 3)```
Ensure value is greater than

#### exclusiveMax
```@constraint(exclusiveMax: 3)```
Ensure value is less than

#### multipleOf
```@constraint(multipleOf: 10)```
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
const formatError = function (error) {
  if (error.originalError && error.originalError.code === 'ERR_GRAPHQL_CONSTRAINT_VALIDATION') {
    // return a custom object
  }

  return error
}

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, formatError }))

```
### uniqueTypeName
```@constraint(uniqueTypeName: "Unique_Type_Name")```
Override the unique type name generate by the library to the one passed as an argument
