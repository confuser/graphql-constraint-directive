const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, formatError, isSchemaWrapperImplType, isServerValidatorRule, isServerValidatorEnvelop, isStatusCodeError, isServerValidatorApollo4 } = require('./testutils')
const { GraphQLError } = require('graphql/error')

module.exports.test = function (setup, implType) {
  describe('@constraint String in INPUT_FIELD_DEFINITION', function () {
    const query = `mutation createBook($input: BookInput) {
      createBook(input: $input) {
        title
      }
    }`

    describe('#minLength', function () {
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
        title: String! @constraint(minLength: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'he💩' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a💩' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a💩" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_minLength_3"') + '. Must be at least 3 characters in length')
      })

      it('should fail with empty string', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_minLength_3"') + '. Must be at least 3 characters in length')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#maxLength', function () {
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
        title: String @constraint(maxLength: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a💩' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should pass with null', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: null } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'fob💩' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "fob💩" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_maxLength_3"') + '. Must be no more than 3 characters in length')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#startsWith', function () {
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
        title: String! @constraint(startsWith: "💩")
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '💩foo' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'bar💩' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "bar💩" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_startsWith_"') + '. Must start with 💩')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#endsWith', function () {
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
        title: String! @constraint(endsWith: "💩")
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a💩' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '💩bar' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "💩bar" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_endsWith_"') + '. Must end with 💩')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#contains', function () {
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
        title: String! @constraint(contains: "💩")
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a💩o' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'fobar' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "fobar" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_contains_"') + '. Must contain 💩')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#notContains', function () {
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
        title: String! @constraint(notContains: "foo")
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '💩' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '💩foobar' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "💩foobar" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_notContains_foo"') + '. Must not contain foo')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#pattern', function () {
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
        title: String! @constraint(pattern: "^[0-9a-zA-Z]*$")
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'afoo' } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: '£££' } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "£££" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_pattern_09azAZ"') + '. Must match ^[0-9a-zA-Z]*$')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })

    describe('#format', function () {
      describe('#byte', function () {
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
          title: String! @constraint(format: "byte")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "£££" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_byte"') + '. Must be in byte format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#date-time', function () {
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
          title: String! @constraint(format: "date-time")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_datetime"') + '. Must be a date-time in RFC 3339 format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#date', function () {
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
          title: String! @constraint(format: "date")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_date"') + '. Must be a date in ISO 8601 format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#email', function () {
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
          title: String! @constraint(format: "email")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_email"') + '. Must be in email format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#ipv4', function () {
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
          title: String! @constraint(format: "ipv4")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_ipv4"') + '. Must be in IP v4 format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#ipv6', function () {
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
          title: String! @constraint(format: "ipv6")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_ipv6"') + '. Must be in IP v6 format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#uri', function () {
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
          title: String! @constraint(format: "uri")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_uri"') + '. Must be in URI format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      if (!isSchemaWrapperImplType(implType)) {
        describe('#custom', function () {
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
          title: String! @constraint(format: "test-format")
        }`

            const testFormat = (value) => {
              if (value === 'this is a test value') return true

              throw new GraphQLError('Must be in test format format')
            }

            const pluginOptions = { formats: { 'test-format': testFormat } }

            this.request = await setup({ typeDefs: this.typeDefs, pluginOptions })
          })

          it('should pass', async function () {
            const { body, statusCode } = await this.request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({
                query, variables: { input: { title: 'this is a test value' } }
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

            isStatusCodeError(statusCode, implType)
            strictEqual(body.errors[0].message,
              'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_test-format"') + '. Must be in test format format')
          })
        })
      }

      describe('#uuid', function () {
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
          title: String! @constraint(format: "uuid")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
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

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_uuid"') + '. Must be in UUID format')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
      })

      describe('#unknown', function () {
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
          title: String! @constraint(format: "test")
        }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({
              query, variables: { input: { title: 'a' } }
            })

          isStatusCodeError(statusCode, implType)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_format_test"') + '. Invalid format type test')
        })

        if (isSchemaWrapperImplType(implType)) {
          it('should throw custom error', async function () {
            const request = await setup({ typeDefs: this.typeDefs, formatError })
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
        }
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
        title: String! @constraint(minLength: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      if (!isServerValidatorEnvelop(implType)) {
        it('should fail with null', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: null } } })

          if (isServerValidatorRule(implType)) { strictEqual(statusCode, 500) } else { isServerValidatorApollo4(implType) ? strictEqual(statusCode, 200) : strictEqual(statusCode, 400) }
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value null at "input.title"; Expected non-nullable type "' + valueByImplType(implType, 'title_String_NotNull_minLength_3', 'String') + '!" not to be null.')
        })

        it('should fail with undefined', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: undefined } } })

          // console.log(JSON.stringify(body))
          if (isServerValidatorRule(implType)) { strictEqual(statusCode, 500) } else { isServerValidatorApollo4(implType) ? strictEqual(statusCode, 200) : strictEqual(statusCode, 400) }
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value {}; Field "title" of required type "' + valueByImplType(implType, 'title_String_NotNull_minLength_3', 'String') + '!" was not provided.')
        })
      }
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
        title: String @constraint(minLength: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
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

    describe('other directives', function () {
      const query = `mutation createBook($input: BookInput, $skipTest: Boolean!) {
        createBook(input: $input) {
          title @skip(if: $skipTest)
        }
      }`

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
        title: String! @constraint(minLength: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'he💩' }, skipTest: false } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 'a💩' }, skipTest: false } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value "a💩" at "input.title"' + valueByImplType(implType, '; Expected type "title_String_NotNull_minLength_3"') + '. Must be at least 3 characters in length')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: 'a💩' }, skipTest: false } })

          strictEqual(statusCode, 400)
          deepStrictEqual(body.errors[0], {
            message: 'Must be at least 3 characters in length',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'minLength', value: 3 }]
          })
        })
      }
    })

    if (isSchemaWrapperImplType(implType)) {
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
        title: String! @constraint(minLength: 3, uniqueTypeName: "BookInput_Title")
      }`

          this.request = await setup({ typeDefs: this.typeDefs })
        })

        it('should pass', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: 'he💩' } } })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { createBook: null } })
        })

        it('should fail', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: 'a💩' } } })

          strictEqual(statusCode, 400)
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value "a💩" at "input.title"; Expected type "BookInput_Title". Must be at least 3 characters in length')
        })

        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
    }
  })

  if (isSchemaWrapperImplType(implType)) {
    describe('@constraint String in FIELD_DEFINITION', function () {
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

      describe('#minLength', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(minLength: 3)
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'foo' }, { title: 'foobar' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 'fo' }, { title: 'foo' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be at least 3 characters in length')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 'fo' }, { title: 'foo' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must be at least 3 characters in length',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'minLength', value: 3 }]
          })
        })
      })

      describe('#maxLength', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(maxLength: 3)
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'fo' }, { title: 'foo' }, { title: 'bar' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 'foo' }, { title: 'foobar' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be no more than 3 characters in length')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 'foo' }, { title: 'foobar' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must be no more than 3 characters in length',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'maxLength', value: 3 }]
          })
        })
      })

      describe('#startsWith', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(startsWith: "💩")
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: '💩foo' }, { title: '💩bar' }, { title: '💩baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: '💩foo' }, { title: '💩bar' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must start with 💩')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: '💩foo' }, { title: '💩bar' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must start with 💩',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'startsWith', value: '💩' }]
          })
        })
      })

      describe('#endsWith', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(endsWith: "💩")
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'foo💩' }, { title: 'bar💩' }, { title: 'baz💩' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 'foo💩' }, { title: 'bar💩' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must end with 💩')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 'foo💩' }, { title: 'bar💩' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must end with 💩',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'endsWith', value: '💩' }]
          })
        })
      })

      describe('#contains', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(contains: "💩")
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'foo💩foo' }, { title: 'bar💩bar' }, { title: 'baz💩baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 'foo💩foo' }, { title: 'bar💩bar' }, { title: 'bazbaz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must contain 💩')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 'foo💩foo' }, { title: 'bar💩bar' }, { title: 'bazbaz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must contain 💩',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'contains', value: '💩' }]
          })
        })
      })

      describe('#notContains', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(notContains: "💩")
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'foo' }, { title: 'bar' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 'foo💩foo' }, { title: 'barr' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must not contain 💩')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 'foo💩foo' }, { title: 'barr' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must not contain 💩',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'notContains', value: '💩' }]
          })
        })
      })

      describe('#pattern', function () {
        before(async function () {
          this.typeDefs = `
      type Query {
        books: [Book]
      }
      type Book {
        title: String @constraint(pattern: "^[0-9a-zA-Z]*$")
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'foo' }, { title: 'bar' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: '💩' }, { title: '£££' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must match ^[0-9a-zA-Z]*$')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: '💩' }, { title: '£££' }, { title: 'baz' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
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
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "byte")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: 'afoo' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: '£££' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be in byte format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: '£££' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be in byte format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'byte' }]
            })
          })
        })

        describe('#date-time', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "date-time")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: '2018-05-16T12:57:00Z' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: '2018-05-1612:57:00Z' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be a date-time in RFC 3339 format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: '2018-05-1612:57:00Z' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be a date-time in RFC 3339 format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'date-time' }]
            })
          })
        })

        describe('#date', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "date")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: '2018-05-16' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be a date in ISO 8601 format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be a date in ISO 8601 format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'date' }]
            })
          })
        })

        describe('#email', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "email")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: 'test@test.com' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: 'testtest.com' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be in email format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: 'testtest.com' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be in email format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'email' }]
            })
          })
        })

        describe('#ipv4', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "ipv4")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: '127.0.0.1' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: '256.256.256.256' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be in IP v4 format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: '256.256.256.256' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be in IP v4 format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'ipv4' }]
            })
          })
        })

        describe('#ipv6', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "ipv6")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: '2001:db8:0000:1:1:1:1:1' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be in IP v6 format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be in IP v6 format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'ipv6' }]
            })
          })
        })

        describe('#uri', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "uri")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: 'foobar.com' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be in URI format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be in URI format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'uri' }]
            })
          })
        })

        describe('#uuid', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "uuid")
        }`
          })

          it('should pass', async function () {
            const mockData = [{ title: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body, { data: { books: mockData } })
          })

          it('should fail', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Must be in UUID format')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Must be in UUID format',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'uuid' }]
            })
          })
        })

        if (!isSchemaWrapperImplType(implType)) {
          describe('#custom', function () {
            before(async function () {
              this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "test-format")
        }`
            })

            it('should pass', async function () {
              const testFormat = (value) => {
                if (value === 'this is a test value') return true

                throw new GraphQLError('Must be in test format format')
              }

              const pluginOptions = { formats: { 'test-format': testFormat } }

              const mockData = [{ title: 'this is a test value' }]
              const request = await setup({
                typeDefs: this.typeDefs,
                formatError,
                resolvers: resolvers(mockData),
                pluginOptions
              })
              const { body, statusCode } = await request
                .post('/graphql')
                .set('Accept', 'application/json')
                .send({ query })

              strictEqual(statusCode, 200)
              deepStrictEqual(body, { data: { books: mockData } })
            })

            it('should fail', async function () {
              const testFormat = (value) => {
                if (value === 'this is a test value') return true

                throw new GraphQLError('Must be in test format format')
              }

              const pluginOptions = { formats: { 'test-format': testFormat } }

              const mockData = [{ title: 'a' }]
              const request = await setup({
                typeDefs: this.typeDefs,
                formatError,
                resolvers: resolvers(mockData),
                pluginOptions
              })
              const { body, statusCode } = await request
                .post('/graphql')
                .set('Accept', 'application/json')
                .send({ query })

              strictEqual(statusCode, 200)
              strictEqual(body.errors[0].message, 'Must be in test format format')
            })

            it('should throw custom error', async function () {
              const testFormat = (value) => {
                if (value === 'this is a test value') return true

                throw new GraphQLError('Must be in test format format')
              }

              const pluginOptions = { formats: { 'test-format': testFormat } }

              const mockData = [{ title: 'a' }]
              const request = await setup({
                typeDefs: this.typeDefs,
                formatError,
                resolvers: resolvers(mockData),
                pluginOptions
              })
              const { body, statusCode } = await request
                .post('/graphql')
                .set('Accept', 'application/json')
                .send({ query })

              strictEqual(statusCode, 200)
              deepStrictEqual(body.errors[0], {
                message: 'Must be in test format format',
                code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
                fieldName: 'title',
                context: [{ arg: 'format', value: 'uuid' }]
              })
            })
          })
        }

        describe('#unknown', function () {
          before(async function () {
            this.typeDefs = `
        type Query {
          books: [Book]
        }
        type Book {
          title: String @constraint(format: "test")
        }`
          })

          it('should fail', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            strictEqual(body.errors[0].message, 'Invalid format type test')
          })

          it('should throw custom error', async function () {
            const mockData = [{ title: 'a' }]
            const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
            const { body, statusCode } = await request
              .post('/graphql')
              .set('Accept', 'application/json')
              .send({ query })

            strictEqual(statusCode, 200)
            deepStrictEqual(body.errors[0], {
              message: 'Invalid format type test',
              code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
              fieldName: 'title',
              context: [{ arg: 'format', value: 'test' }]
            })
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
        title: String @constraint(minLength: 3, uniqueTypeName: "Book_Title")
      }`
        })

        it('should pass', async function () {
          const mockData = [{ title: 'foo' }, { title: 'foobar' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 'fo' }, { title: 'foo' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be at least 3 characters in length')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 'fo' }, { title: 'foo' }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body.errors[0], {
            message: 'Must be at least 3 characters in length',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'minLength', value: 3 }]
          })
        })
      })
    })
  }
}
