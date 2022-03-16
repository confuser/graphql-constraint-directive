const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')
const formatError = (error) => {
  const { message, code, fieldName, context } = error?.originalError?.originalError || error?.originalError || error

  return { message, code, fieldName, context }
}

describe('@constraint Int in INPUT_FIELD_DEFINITION', function () {
  const query = `mutation createBook($input: BookInput) {
    createBook(input: $input) {
      title
    }
  }`

  describe('#min', function () {
    before(async function () {
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

      this.request = await setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 2 at "input.title"; Expected type "title_Int_NotNull_min_3". Must be at least 3')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
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
    before(async function () {
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

      this.request = await setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 4 } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 4 at "input.title"; Expected type "title_Int_max_3". Must be no greater than 3')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
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
    before(async function () {
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

      this.request = await setup(this.typeDefs)
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
        'Variable "$input" got invalid value 3 at "input.title"; Expected type "title_Int_NotNull_exclusiveMin_3". Must be greater than 3')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
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
    before(async function () {
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

      this.request = await setup(this.typeDefs)
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
        'Variable "$input" got invalid value 3 at "input.title"; Expected type "title_Int_NotNull_exclusiveMax_3". Must be less than 3')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
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
    before(async function () {
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

      this.request = await setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 10 } } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 7 } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 7 at "input.title"; Expected type "title_Int_NotNull_multipleOf_2". Must be a multiple of 2')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
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
    before(async function () {
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

      this.request = await setup(this.typeDefs)
    })

    it('should fail with null', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: null } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value null at "input.title"; Expected non-nullable type "title_Int_NotNull_multipleOf_2!" not to be null.')
    })

    it('should fail with undefined', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: undefined } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {}; Field "title" of required type "title_Int_NotNull_multipleOf_2!" was not provided.')
    })
  })

  describe('#null', function () {
    before(async function () {
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
        title: Int @constraint(multipleOf: 2)
      }`

      this.request = await setup(this.typeDefs)
    })

    it('should pass with null', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: null } } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should pass with undefined', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: undefined } } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })
  })

  describe('#uniqueTypeName', function () {
    before(async function () {
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

      this.request = await setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } } })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value 2 at "input.title"; Expected type "BookInput_Title". Must be at least 3')
    })

    it('should throw custom error', async function () {
      const request = await setup(this.typeDefs, formatError)
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
    before(async function () {
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
      const mockData = [{ title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be at least 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
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
    before(async function () {
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
      const mockData = [{ title: 1 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: -1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be at least 0')
    })
  })

  describe('#max', function () {
    before(async function () {
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
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be no greater than 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{ title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
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
    before(async function () {
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
      const mockData = [{ title: 0 }, { title: -2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: -2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be no greater than 0')
    })
  })

  describe('#exclusiveMin', function () {
    before(async function () {
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
      const mockData = [{ title: 3 }, { title: 4 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be greater than 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{ title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
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
    before(async function () {
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
      const mockData = [{ title: 1 }, { title: 4 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 0 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be greater than 0')
    })
  })

  describe('#exclusiveMax', function () {
    before(async function () {
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
      const mockData = [{ title: 0 }, { title: 1 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be less than 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
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
    before(async function () {
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
      const mockData = [{ title: -1 }, { title: -2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 0 }, { title: -2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be less than 0')
    })
  })

  describe('#multipleOf', function () {
    before(async function () {
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
      const mockData = [{ title: 2 }, { title: 4 }, { title: 6 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 1 }, { title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be a multiple of 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{ title: 1 }, { title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
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

  describe('#uniqueTypeName', function () {
    before(async function () {
      this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: Int @constraint(min: 2, uniqueTypeName: "Book_Title")
      }
      `
    })

    it('should pass', async function () {
      const mockData = [{ title: 2 }, { title: 3 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { books: mockData } })
    })

    it('should fail', async function () {
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query })

      strictEqual(statusCode, 200)
      strictEqual(body.errors[0].message, 'Must be at least 2')
    })

    it('should throw custom error', async function () {
      const mockData = [{ title: 1 }, { title: 2 }]
      const request = await setup(this.typeDefs, formatError, resolvers(mockData))
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
})
