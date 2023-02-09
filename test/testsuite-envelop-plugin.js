const setup = require('./setup-envelop-plugin')
const { IMPL_TYPE_SERVER_VALIDATOR_ENVELOP } = require('./testutils')

const IMPL_TYPE = IMPL_TYPE_SERVER_VALIDATOR_ENVELOP

describe('Server validator based implementation - Envelop plugin', function () {
  require('./introspection.test').test(setup, IMPL_TYPE)
  require('./argument.test').test(setup, IMPL_TYPE)
  require('./input-object.test').test(setup, IMPL_TYPE)
  require('./array.test').test(setup, IMPL_TYPE)
  require('./array-structures.test').test(setup, IMPL_TYPE)
  require('./array-size.test').test(setup, IMPL_TYPE)
  require('./fragment-inline.test').test(setup, IMPL_TYPE)
  require('./fragment.test').test(setup, IMPL_TYPE)
  require('./variable.test').test(setup, IMPL_TYPE)
  require('./float.test').test(setup, IMPL_TYPE)
  require('./int.test').test(setup, IMPL_TYPE)
  require('./string.test').test(setup, IMPL_TYPE)
  require('./argument-dynamic.test').test(setup, IMPL_TYPE)
  require('./union.test').test(setup, IMPL_TYPE)
})
