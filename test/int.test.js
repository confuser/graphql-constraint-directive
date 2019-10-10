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
        'Variable "$input" got invalid value {"title":2}; Expected type ConstraintNumber at value.title; Must be at least 3')
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
        'Variable "$input" got invalid value {"title":4}; Expected type ConstraintNumber at value.title; Must be no greater than 3')
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
        'Variable "$input" got invalid value {"title":3}; Expected type ConstraintNumber at value.title; Must be greater than 3')
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
        'Variable "$input" got invalid value {"title":3}; Expected type ConstraintNumber at value.title; Must be less than 3')
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
        'Variable "$input" got invalid value {"title":7}; Expected type ConstraintNumber at value.title; Must be a multiple of 2')
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
})

describe('@constraint Int in FIELD_DEFINITION', function () {
  const query = `query {
    books {
      title
    }
  }`
  const resolvers = function (data) {
    return {
      Query: {
        books () {
          return data
        }
      }
    }
  }

  describe('#min', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(min: 2)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 1}, {title: 2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be at least 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{title: 1}, {title: 2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body.errors[0], {
        message: 'Must be at least 2',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'min', value: 2 }]
      })
    })
  })

  describe('#min0', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(min: 0)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 1}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: -1}, {title: 2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be at least 0')
    })
  })

  describe('#max', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(max: 2)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 1}, {title: 2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be no greater than 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body.errors[0], {
        message: 'Must be no greater than 2',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'max', value: 2 }]
      })
    })
  })

  describe('#max0', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(max: 0)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 0}, {title: -2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: -2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be no greater than 0')
    })
  })

  describe('#exclusiveMin', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(exclusiveMin: 2)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 3}, {title: 4}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be greater than 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body.errors[0], {
        message: 'Must be greater than 2',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'exclusiveMin', value: 2 }]
      })
    })
  })

  describe('#exclusiveMin0', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(exclusiveMin: 0)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 1}, {title: 4}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 0}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be greater than 0')
    })
  })

  describe('#exclusiveMax', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(exclusiveMax: 2)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 0}, {title: 1}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 1}, {title: 2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be less than 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{title: 1}, {title: 2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body.errors[0], {
        message: 'Must be less than 2',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'exclusiveMax', value: 2 }]
      })
    })
  })

  describe('#exclusiveMax0', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(exclusiveMax: 0)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: -1}, {title: -2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 0}, {title: -2}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be less than 0')
    })
  })

  describe('#multipleOf', function () {
    before(function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(multipleOf: 2)
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{title: 2}, {title: 4}, {title: 6}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{title: 1}, {title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be a multiple of 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{title: 1}, {title: 2}, {title: 3}]
      const request = setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body.errors[0], {
        message: 'Must be a multiple of 2',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'multipleOf', value: 2 }]
      })
    })
  })
})
