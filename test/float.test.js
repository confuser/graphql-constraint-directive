const { deepStrictEqual, strictEqual } = require('assert')
const { valueByImplType, formatError, isSchemaWrapperImplType, isServerValidatorRule, isServerValidatorEnvelop, isStatusCodeError, isServerValidatorApollo4 } = require('./testutils')

module.exports.test = function (setup, implType) {
  describe('@constraint Float in INPUT_FIELD_DEFINITION', function () {
    const query = `mutation createBook($input: BookInput) {
      createBook(input: $input) {
        title
      }
    }
    `

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
        title: Float! @constraint(min: 2.99)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
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

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 2 at "input.title"' + valueByImplType(implType, '; Expected type "title_Float_NotNull_min_2dot99"') + '. Must be at least 2.99')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: 2 } } })

          strictEqual(statusCode, 400)
          deepStrictEqual(body.errors[0], {
            message: 'Must be at least 2.99',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'min', value: 2.99 }]
          })
        })
      }
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
        title: Float @constraint(max: 3.1)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
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

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 4 at "input.title"' + valueByImplType(implType, '; Expected type "title_Float_max_3dot1"') + '. Must be no greater than 3.1')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: 4 } } })

          strictEqual(statusCode, 400)
          deepStrictEqual(body.errors[0], {
            message: 'Must be no greater than 3.1',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'max', value: 3.1 }]
          })
        })
      }
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
        title: Float! @constraint(exclusiveMin: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({
            query, variables: { input: { title: 4.5 } }
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

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 3 at "input.title"' + valueByImplType(implType, '; Expected type "title_Float_NotNull_exclusiveMin_3"') + '. Must be greater than 3')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
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
        title: Float! @constraint(exclusiveMax: 3)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
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

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 3 at "input.title"' + valueByImplType(implType, '; Expected type "title_Float_NotNull_exclusiveMax_3"') + '. Must be less than 3')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
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
        title: Float! @constraint(multipleOf: 2.5)
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })

      it('should pass', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 12.5 } } })

        strictEqual(statusCode, 200)
        deepStrictEqual(body, { data: { createBook: null } })
      })

      it('should fail', async function () {
        const { body, statusCode } = await this.request
          .post('/graphql')
          .set('Accept', 'application/json')
          .send({ query, variables: { input: { title: 7 } } })

        isStatusCodeError(statusCode, implType)
        strictEqual(body.errors[0].message,
          'Variable "$input" got invalid value 7 at "input.title"' + valueByImplType(implType, '; Expected type "title_Float_NotNull_multipleOf_2dot5"') + '. Must be a multiple of 2.5')
      })

      if (isSchemaWrapperImplType(implType)) {
        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: 7 } } })

          strictEqual(statusCode, 400)
          deepStrictEqual(body.errors[0], {
            message: 'Must be a multiple of 2.5',
            code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
            fieldName: 'title',
            context: [{ arg: 'multipleOf', value: 2.5 }]
          })
        })
      }
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
        title: Float! @constraint(multipleOf: 2)
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
            'Variable "$input" got invalid value null at "input.title"; Expected non-nullable type "' + valueByImplType(implType, 'title_Float_NotNull_multipleOf_2', 'Float') + '!" not to be null.')
        })

        it('should fail with undefined', async function () {
          const { body, statusCode } = await this.request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query, variables: { input: { title: undefined } } })

          if (isServerValidatorRule(implType)) { strictEqual(statusCode, 500) } else { isServerValidatorApollo4(implType) ? strictEqual(statusCode, 200) : strictEqual(statusCode, 400) }
          strictEqual(body.errors[0].message,
            'Variable "$input" got invalid value {}; Field "title" of required type "' + valueByImplType(implType, 'title_Float_NotNull_multipleOf_2', 'Float') + '!" was not provided.')
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
        title: Float @constraint(multipleOf: 2)
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
        title: Float! @constraint(min: 3, uniqueTypeName: "BookInput_Title")
      }`

        this.request = await setup({ typeDefs: this.typeDefs })
      })
      if (isSchemaWrapperImplType(implType)) {
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
            'Variable "$input" got invalid value 2 at "input.title"' + valueByImplType(implType, '; Expected type "BookInput_Title"') + '. Must be at least 3')
        })

        it('should throw custom error', async function () {
          const request = await setup({ typeDefs: this.typeDefs, formatError })
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
      }
    })
  })

  if (isSchemaWrapperImplType(implType)) {
    describe('@constraint Float in FIELD_DEFINITION', function () {
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
        title: Float @constraint(min: 2)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be at least 2')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(min: 0)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 1 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: -1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(max: 2)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be no greater than 2')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(max: 0)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 0 }, { title: -2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: -2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(exclusiveMin: 2)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 3 }, { title: 4 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be greater than 2')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(exclusiveMin: 0)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 1 }, { title: 4 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 0 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(exclusiveMax: 2)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 0 }, { title: 1 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be less than 2')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(exclusiveMax: 0)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: -1 }, { title: -2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 0 }, { title: -2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(multipleOf: 2)
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 2 }, { title: 4 }, { title: 6 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 1 }, { title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be a multiple of 2')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 1 }, { title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
        title: Float @constraint(min: 2, uniqueTypeName: "Book_Title")
      }
      `
        })

        it('should pass', async function () {
          const mockData = [{ title: 2 }, { title: 3 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          deepStrictEqual(body, { data: { books: mockData } })
        })

        it('should fail', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
          const { body, statusCode } = await request
            .post('/graphql')
            .set('Accept', 'application/json')
            .send({ query })

          strictEqual(statusCode, 200)
          strictEqual(body.errors[0].message, 'Must be at least 2')
        })

        it('should throw custom error', async function () {
          const mockData = [{ title: 1 }, { title: 2 }]
          const request = await setup({ typeDefs: this.typeDefs, formatError, resolvers: resolvers(mockData) })
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
  }
}
