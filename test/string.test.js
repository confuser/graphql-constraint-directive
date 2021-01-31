const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')
const formatError = (error) => {
  const { message, code, fieldName, context } = error.originalError

  return { message, code, fieldName, context }
}

describe('@constraint String in INPUT_FIELD_DEFINITION', function () {
  const query = `mutation createBook($input: BookInput) {
    createBook(input: $input) {
      title
    }
  }`

  describe('#minLength', function () {
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
        title: String! @constraint(minLength: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'he💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "a💩" at "input.title"; Expected type "ConstraintString". Must be at least 3 characters in length')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be at least 3 characters in length',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'minLength', value: 3 }]
      })
    })
  })

  describe('#maxLength', function () {
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
        title: String @constraint(maxLength: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'fob💩' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "fob💩" at "input.title"; Expected type "ConstraintString". Must be no more than 3 characters in length')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'fob💩' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be no more than 3 characters in length',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'maxLength', value: 3 }]
      })
    })
  })

  describe('#startsWith', function () {
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
        title: String! @constraint(startsWith: "💩")
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩foo' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'bar💩' } } })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "bar💩" at "input.title"; Expected type "ConstraintString". Must start with 💩')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'bar💩' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must start with 💩',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'startsWith', value: '💩' }]
      })
    })
  })

  describe('#endsWith', function () {
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
        title: String! @constraint(endsWith: "💩")
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩bar' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "💩bar" at "input.title"; Expected type "ConstraintString". Must end with 💩')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩bar' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must end with 💩',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'endsWith', value: '💩' }]
      })
    })
  })

  describe('#contains', function () {
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
        title: String! @constraint(contains: "💩")
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩o' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'fobar' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "fobar" at "input.title"; Expected type "ConstraintString". Must contain 💩')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'foobar' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must contain 💩',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'contains', value: '💩' }]
      })
    })
  })

  describe('#notContains', function () {
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
        title: String! @constraint(notContains: "foo")
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩foobar' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "💩foobar" at "input.title"; Expected type "ConstraintString". Must not contain foo')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩foobar' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must not contain foo',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'notContains', value: 'foo' }]
      })
    })
  })

  describe('#pattern', function () {
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
        title: String! @constraint(pattern: "^[0-9a-zA-Z]*$")
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'afoo' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '£££' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "£££" at "input.title"; Expected type "ConstraintString". Must match ^[0-9a-zA-Z]*$')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩bar' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must match ^[0-9a-zA-Z]*$',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'pattern', value: '^[0-9a-zA-Z]*$' }]
      })
    })
  })

  describe('#format', function () {
    describe('#byte', function () {
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
          title: String! @constraint(format: "byte")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'afoo' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '£££' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "£££" at "input.title"; Expected type "ConstraintString". Must be in byte format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '£££' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be in byte format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'byte' }]
        })
      })
    })

    describe('#date-time', function () {
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
          title: String! @constraint(format: "date-time")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '2018-05-16 12:57:00Z' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be a date-time in RFC 3339 format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be a date-time in RFC 3339 format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'date-time' }]
        })
      })
    })

    describe('#date', function () {
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
          title: String! @constraint(format: "date")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '2018-05-16' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be a date in ISO 8601 format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be a date in ISO 8601 format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'date' }]
        })
      })
    })

    describe('#email', function () {
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
          title: String! @constraint(format: "email")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'test@test.com' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be in email format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be in email format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'email' }]
        })
      })
    })

    describe('#ipv4', function () {
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
          title: String! @constraint(format: "ipv4")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '127.0.0.1' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be in IP v4 format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be in IP v4 format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'ipv4' }]
        })
      })
    })

    describe('#ipv6', function () {
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
          title: String! @constraint(format: "ipv6")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '2001:db8:0000:1:1:1:1:1' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be in IP v6 format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be in IP v6 format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'ipv6' }]
        })
      })
    })

    describe('#uri', function () {
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
          title: String! @constraint(format: "uri")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'foobar.com' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be in URI format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be in URI format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'uri' }]
        })
      })
    })

    describe('#uuid', function () {
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
          title: String! @constraint(format: "uuid")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Must be in UUID format')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Must be in UUID format',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'uuid' }]
        })
      })
    })

    describe('#unknown', function () {
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
          title: String! @constraint(format: "test")
        }`

        this.request = setup(this.typeDefs)
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a" at "input.title"; Expected type "ConstraintString". Invalid format type test')
      })

      it('should throw custom error', async function () {
        const request = setup(this.typeDefs, formatError)
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a' } } })

        strictEqual(statusCode, 400)
        deepStrictEqual(body.errors[0], {
          message: 'Invalid format type test',
          code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
          fieldName: 'title',
          context: [{ arg: 'format', value: 'test' }]
        })
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
        title: String! @constraint(minLength: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should fail with null', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: null } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value null at "input.title"; Expected non-nullable type "ConstraintString!" not to be null.')
    })

    it('should fail with undefined', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: undefined } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {}; Field "title" of required type "ConstraintString!" was not provided.')
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
        title: String! @constraint(minLength: 3)
      }`

      this.request = setup(this.typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'he💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await this.request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value "a💩" at "input.title"; Expected type "ConstraintString". Must be at least 3 characters in length')
    })

    it('should throw custom error', async function () {
      const request = setup(this.typeDefs, formatError)
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } } })

      strictEqual(statusCode, 400)
      deepStrictEqual(body.errors[0], {
        message: 'Must be at least 3 characters in length',
        code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
        fieldName: 'title',
        context: [{ arg: 'minLength', value: 3 }]
      })
    })
  })
})
