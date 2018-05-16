const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')

describe('@constraint Int', function () {
  const query = `mutation createBook($input: BookInput) {
    createBook(input: $input) {
      title
    }
  }`

  describe('#min', function () {
    let request

    before(function () {
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
        title: Int! @constraint(min: 3)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":2}; Expected type ConstraintNumber at value.title; Must be at least 3')
    })
  })

  describe('#max', function () {
    let request

    before(function () {
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
        title: Int! @constraint(max: 3)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 4 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":4}; Expected type ConstraintNumber at value.title; Must be no greater than 3')
    })
  })

  describe('#exclusiveMin', function () {
    let request

    before(function () {
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
        title: Int! @constraint(exclusiveMin: 3)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 4 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":3}; Expected type ConstraintNumber at value.title; Must be greater than 3')
    })
  })

  describe('#exclusiveMax', function () {
    let request

    before(function () {
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
        title: Int! @constraint(exclusiveMax: 3)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 2 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query, variables: { input: { title: 3 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":3}; Expected type ConstraintNumber at value.title; Must be no greater than 3')
    })
  })

  describe('#multipleOf', function () {
    let request

    before(function () {
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
        title: Int! @constraint(multipleOf: 2)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 10 } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 7 } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":7}; Expected type ConstraintNumber at value.title; Must be a multiple of 2')
    })
  })
})
