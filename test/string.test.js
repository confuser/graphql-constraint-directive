const { deepStrictEqual, strictEqual } = require('assert')
const setup = require('./setup')

describe('@constraint String', function () {
  const query = `mutation createBook($input: BookInput) {
    createBook(input: $input) {
      title
    }
  }`

  describe('#minLength', function () {
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
        title: String! @constraint(minLength: 3)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'he💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"a💩"}; Expected type ConstraintString at value.title; Must be at least 3 characters in length')
    })
  })

  describe('#maxLength', function () {
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
        title: String! @constraint(maxLength: 3)
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'fob💩' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"fob💩"}; Expected type ConstraintString at value.title; Must be no more than 3 characters in length')
    })
  })

  describe('#startsWith', function () {
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
        title: String! @constraint(startsWith: "💩")
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩foo' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'bar💩' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"bar💩"}; Expected type ConstraintString at value.title; Must start with 💩')
    })
  })

  describe('#endsWith', function () {
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
        title: String! @constraint(endsWith: "💩")
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩bar' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"💩bar"}; Expected type ConstraintString at value.title; Must end with 💩')
    })
  })

  describe('#contains', function () {
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
        title: String! @constraint(contains: "💩")
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'a💩o' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'fobar' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"fobar"}; Expected type ConstraintString at value.title; Must contain 💩')
    })
  })

  describe('#notContains', function () {
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
        title: String! @constraint(notContains: "foo")
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '💩foobar' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"💩foobar"}; Expected type ConstraintString at value.title; Must not contain foo')
    })
  })

  describe('#pattern', function () {
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
        title: String! @constraint(pattern: "^[0-9a-zA-Z]*$")
      }`

      request = setup(typeDefs)
    })

    it('should pass', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: 'afoo' } }
        })

      strictEqual(statusCode, 200)
      deepStrictEqual(body, { data: { createBook: null } })
    })

    it('should fail', async function () {
      const { body, statusCode } = await request
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({ query, variables: { input: { title: '£££' } }
        })

      strictEqual(statusCode, 400)
      strictEqual(body.errors[0].message,
        'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.title; Must match ^[0-9a-zA-Z]*$')
    })
  })

  describe('#format', function () {
    describe('#byte', function () {
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
          title: String! @constraint(format: "byte")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'afoo' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '£££' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.title; Must be in byte format')
      })
    })

    describe('#date-time', function () {
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
          title: String! @constraint(format: "date-time")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '2018-05-16 12:57:00Z' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be a date in RFC 3339 format')
      })
    })

    describe('#email', function () {
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
          title: String! @constraint(format: "email")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'test@test.com' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in email format')
      })
    })

    describe('#ipv4', function () {
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
          title: String! @constraint(format: "ipv4")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '127.0.0.1' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in IP v4 format')
      })
    })

    describe('#ipv6', function () {
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
          title: String! @constraint(format: "ipv6")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: '2001:db8:0000:1:1:1:1:1' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in IP v6 format')
      })
    })

    describe('#uri', function () {
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
          title: String! @constraint(format: "uri")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'foobar.com' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in URI format')
      })
    })

    describe('#uuid', function () {
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
          title: String! @constraint(format: "uuid")
        }`

        request = setup(typeDefs)
      })

      it('should pass', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3' } }
          })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 'a' } }
          })

        strictEqual(statusCode, 400)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in UUID format')
      })
    })
  })
})
