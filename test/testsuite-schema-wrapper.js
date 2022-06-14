const setup = require('./setup-schema-wrapper')
const { IMPL_TYPE_SCHEMA_WRAPPER } = require('./testutils')
const introspectionTest = require('./introspection.test')
const argumentTest = require('./argument.test')
const arrayTest = require('./array.test')
const floatTest = require('./float.test')
const intTest = require('./int.test')
const stringTest = require('./string.test')

const IMPL_TYPE = IMPL_TYPE_SCHEMA_WRAPPER

describe('Schema wrapper based implementation', function () {
  introspectionTest.test(setup, IMPL_TYPE)
  argumentTest.test(setup, IMPL_TYPE)
  arrayTest.test(setup, IMPL_TYPE)
  floatTest.test(setup, IMPL_TYPE)
  intTest.test(setup, IMPL_TYPE)
  stringTest.test(setup, IMPL_TYPE)
})
