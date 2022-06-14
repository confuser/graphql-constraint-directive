const setup = require('./setup-apollo-plugin')
const { IMPL_TYPE_SERVER_VALIDATOR } = require('./testutils')
const introspectionTest = require('./introspection.test')
const argumentTest = require('./argument.test')
const argumentInlineTest = require('./argument-inline.test')
// const arrayTest = require('./array.test')
// const floatTest = require('./float.test')
// const intTest = require('./int.test')
// const stringTest = require('./string.test')

const IMPL_TYPE = IMPL_TYPE_SERVER_VALIDATOR

describe('Server validator based implementation - Apollo plugin', function () {
  introspectionTest.test(setup, IMPL_TYPE)
  argumentTest.test(setup, IMPL_TYPE)
  argumentInlineTest.test(setup, IMPL_TYPE)

  // TODO uncomment and update tests once feature implemented
  // arrayTest.test(setup, IMPL_TYPE)
  // floatTest.test(setup, IMPL_TYPE)
  // intTest.test(setup, IMPL_TYPE)
  // stringTest.test(setup, IMPL_TYPE)
})
