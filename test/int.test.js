const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')
const formatError = (error) => {
  const { message, code, fieldName, context } = error.originalError

  return { message, code, fieldName, context }
}

describe('@constraint Int in INPUT_FIELD_DEFINITION', function () {
  const query = `mutation createBook($input: BookInput) {
    createBook(input: $input) {
      title
    }
  }`

  describe('#min', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int! @constraint(min: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 2 at "input.title"; Expected type "ConstraintNumber". Must be at least 3')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be at least 3',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'min', value: 3 }]
      })
    })
  })

  describe('#max', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int @constraint(max: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 4 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 4 at "input.title"; Expected type "ConstraintNumber". Must be no greater than 3')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 4 } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be no greater than 3',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'max', value: 3 }]
      })
    })
  })

  describe('#exclusiveMin', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int! @constraint(exclusiveMin: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 4 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 3 at "input.title"; Expected type "ConstraintNumber". Must be greater than 3')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be greater than 3',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'exclusiveMin', value: 3 }]
      })
    })
  })

  describe('#exclusiveMax', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int! @constraint(exclusiveMax: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 3 at "input.title"; Expected type "ConstraintNumber". Must be less than 3')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be less than 3',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'exclusiveMax', value: 3 }]
      })
    })
  })

  describe('#multipleOf', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int! @constraint(multipleOf: 2)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 10 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 7 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 7 at "input.title"; Expected type "ConstraintNumber". Must be a multiple of 2')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 7 } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be a multiple of 2',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'multipleOf', value: 2 }]
      })
    })
  })

  describe('#notNull', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int! @constraint(multipleOf: 2)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should fail with null', async function () {
      let { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: null } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value null at "input.title"; Expected non-nullable type "ConstraintNumber!" not to be null.')
    })

    it('should fail with undefined', async function () {
      let { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: undefined } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {}; Field "title" of required type "ConstraintNumber!" was not provided.')
    })
  })

  describe('#uniqueTypeName', function () {
    before(function () {
      this.typeDefs = `
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
        title: Int! @constraint(min: 3, uniqueTypeName: "BookInput_Title")
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 2 at "input.title"; Expected type "ConstraintNumber". Must be at least 3')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be at least 3',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'min', value: 3 }]
      })
    })
  })
})
