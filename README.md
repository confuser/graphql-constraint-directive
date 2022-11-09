# graphql-constraint-directive

[![Build Status](https://github.com/confuser/graphql-constraint-directive/actions/workflows/build.yaml/badge.svg)](https://github.com/confuser/graphql-constraint-directive/actions/workflows/build.yaml)
[![Coverage Status](https://coveralls.io/repos/github/confuser/graphql-constraint-directive/badge.svg?branch=master)](https://coveralls.io/github/confuser/graphql-constraint-directive?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/confuser/graphql-constraint-directive/badge.svg?targetFile=package.json)](https://snyk.io/test/github/confuser/graphql-constraint-directive?targetFile=package.json)

Allows using @constraint as a directive to validate input data. Inspired by [Constraints Directives RFC](https://github.com/APIs-guru/graphql-constraints-spec) and OpenAPI

## Install
```
npm install graphql-constraint-directive
```

For GraphQL v15 and below, use v2 of this package

```
npm install graphql-constraint-directive@v2
```

## Usage
There are multiple ways to make use of the constraint directive in your project. Below outlines the benefits and caveats. Please choose the most appropriate to your use case.

### Schema wrapper

Implementation based on schema wrappers - basic scalars are wrapped as custom scalars with validations. 

#### Benefits
* based on `graphql` library, works everywhere 
* posibility to also validate GraphQL response data

#### Caveats
* modifies GraphQL schema, basic scalars (Int, Float, String) are replaced by custom scalars

```js
const { constraintDirective, constraintDirectiveTypeDefs } = require('graphql-constraint-directive')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
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

let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
})
schema = constraintDirective()(schema)

const app = express()
const server = new ApolloServer({ schema })

await server.start()

server.applyMiddleware({ app })

```

### Server plugin

Implementation based on server plugin. Common server plugins are implemented,
function `validateQuery(schema, query, variables, operationName)` can be used to implement additional plugins.

#### Benefits
* schema stays unmodified

#### Caveats
* runs only in supported servers
* validates only GraphQL query, not response data

#### Envelop

Use as an [Envelop plugin](https://www.envelop.dev) in supported frameworks, e.g. [GraphQL Yoga](https://www.graphql-yoga.com/).
Functionality is plugged in `execute` phase

```js
const { createEnvelopQueryValidationPlugin, constraintDirectiveTypeDefs } = require('graphql-constraint-directive')
const express = require('express')
const { createServer } = require('@graphql-yoga/node')
const { makeExecutableSchema } = require('@graphql-tools/schema')

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

let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
})

const app = express()

const yoga = createServer({
    schema,
    plugins: [createEnvelopQueryValidationPlugin()],
    graphiql: false
})

app.use('/', yoga)

app.listen(4000);
```

#### Apollo Server

As an [Apollo Server](https://www.apollographql.com/docs/apollo-server/) plugin

```js
const { createApolloQueryValidationPlugin, constraintDirectiveTypeDefs } = require('graphql-constraint-directive')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')

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

let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
})

const plugins = [
  createApolloQueryValidationPlugin({
    schema
  })
]

const app = express()
const server = new ApolloServer({ 
  schema,
  plugins
})

await server.start()

server.applyMiddleware({ app })
```
#### Apollo subgraph server

There is a small change required to make the Apollo Server quickstart work when trying to build an [Apollo Subgraph Server](https://www.apollographql.com/docs/federation/building-supergraphs/subgraphs-apollo-server/).

Notably, we need to wrap our `typDefs` with the `gql` tag, from either the `graphql-tag` or the `apollo-server-core` packages. This converts the `typeDefs` to an `AST` or `DocumentNode` format and is required by `buildSubgraphSchema`, as mentioned in their [docs](https://www.apollographql.com/docs/federation/building-supergraphs/subgraphs-apollo-server/):
>While Apollo Server can accept a string (or `DocumentNode`) for its `typeDefs`, the `buildSubgraphSchema` function below requires the schema we pass in to be a `DocumentNode`.

Then, we must use the `buildSubgraphSchema` function to build a schema that can be passed to an Apollo Gateway/supergraph, instead of `makeExecuteableSchema`. This uses `makeExecutableSchema` under the hood.

```ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { gql } from 'graphql-tag'; // Or can be imported from 'apollo-server-core'
import { buildSubgraphSchema } from '@apollo/subgraph';
import { createApolloQueryValidationPlugin, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

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
  }
`;

const schema = buildSubgraphSchema({
  typeDefs: [gql(constraintDirectiveTypeDefs), typeDefs]
});

const plugins = [
  createApolloQueryValidationPlugin({
    schema
  })
]

const server = new ApolloServer({
  schema,
  plugins
});

await startStandaloneServer(server);
```

#### Express

As a [Validation rule](https://graphql.org/graphql-js/validation/) when query `variables` are available 

```js
const { createQueryValidationRule, constraintDirectiveTypeDefs } = require('graphql-constraint-directive')
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')

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

let schema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
})

const app = express()

app.use(
  '/api',
  graphqlHTTP(async (request, response, { variables }) => ({
    schema,
    validationRules: [
      createQueryValidationRule({
        variables
      })
    ]
  }))
)
app.listen(4000);

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

### Array/List

#### minItems
```@constraint(minItems: 3)```
Restrict array/List to a minimum length

#### maxItems
```@constraint(maxItems: 3)```
Restrict array/List to a maximum length

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
  const code = error?.originalError?.originalError?.code || error?.originalError?.code || error?.code
  if (code === 'ERR_GRAPHQL_CONSTRAINT_VALIDATION') {
    // return a custom object
  }

  return error
}

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, formatError }))

```

#### Apollo Server
Throws a [`UserInputError`](https://www.apollographql.com/docs/apollo-server/data/errors/#bad_user_input) for each validation error

#### Envelop
The Envelop plugin throws a prefilled `GraphQLError` for each validation error

### uniqueTypeName
```@constraint(uniqueTypeName: "Unique_Type_Name")```
Override the unique type name generate by the library to the one passed as an argument. 
Has meaning only for `Schema wrapper` implementation.
