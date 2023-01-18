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

#### Apollo 3 Server

As an [Apollo 3 Server](https://www.apollographql.com/docs/apollo-server/v3) plugin

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

#### Apollo 4 Server

As an [Apollo 4 Server](https://www.apollographql.com/docs/apollo-server/v4) plugin

```js
const { createApollo4QueryValidationPlugin, constraintDirectiveTypeDefs } = require('graphql-constraint-directive/apollo4')
const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const cors = require('cors')
const { json } = require('body-parser')

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
  createApollo4QueryValidationPlugin({
    schema
  })
]

const app = express()
const server = new ApolloServer({ 
  schema,
  plugins
})

await server.start()

app.use(
    '/',
    cors(),
    json(),
    expressMiddleware(server)
  )
```
#### Apollo 4 Subgraph server

There is a small change required to make the Apollo Server quickstart work when trying to build an [Apollo Subgraph Server](https://www.apollographql.com/docs/federation/building-supergraphs/subgraphs-apollo-server/).
We must use the `buildSubgraphSchema` function to build a schema that can be passed to an Apollo Gateway/supergraph, instead of `makeExecuteableSchema`. This uses `makeExecutableSchema` under the hood.

```ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { createApollo4QueryValidationPlugin, constraintDirectiveTypeDefsGql } from 'graphql-constraint-directive/apollo4';

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
  typeDefs: [constraintDirectiveTypeDefsGql, typeDefs]
});

const plugins = [
  createApollo4QueryValidationPlugin({
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

*This implementation is untested now, as [`express-graphql` module](https://github.com/graphql/express-graphql) is not maintained anymore.* 

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

#### Apollo Server 3
Throws a [`UserInputError`](https://www.apollographql.com/docs/apollo-server/data/errors/#bad_user_input) for each validation error.

#### Apollo Server 4
Throws a prefilled `GraphQLError` with `extensions.code` set to `BAD_USER_INPUT` and http status code `400`. 
In case of more validation errors, top level error is generic with `Query is invalid, for details see extensions.validationErrors` message, 
detailed errors are stored in `extensions.validationErrors` of this error.

#### Envelop
The Envelop plugin throws a prefilled `GraphQLError` for each validation error.

### uniqueTypeName
```@constraint(uniqueTypeName: "Unique_Type_Name")```
Override the unique type name generate by the library to the one passed as an argument. 
Has meaning only for `Schema wrapper` implementation.
