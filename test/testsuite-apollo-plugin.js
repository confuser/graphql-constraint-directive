const setup = require('./setup-apollo-plugin')
const { IMPL_TYPE_SERVER_VALIDATOR } = require('./testutils')

const IMPL_TYPE = IMPL_TYPE_SERVER_VALIDATOR

describe('Server validator based implementation - Apollo plugin', function () {
  require('./introspection.test').test(setup, IMPL_TYPE)
  require('./argument.test').test(setup, IMPL_TYPE)
  require('./input-object.test').test(setup, IMPL_TYPE)
  require('./array.test').test(setup, IMPL_TYPE)
  require('./array-structures.test').test(setup, IMPL_TYPE)
  require('./fragment-inline.test').test(setup, IMPL_TYPE)
  require('./fragment.test').test(setup, IMPL_TYPE)
  require('./variable.test').test(setup, IMPL_TYPE)
  require('./float.test').test(setup, IMPL_TYPE)
  require('./int.test').test(setup, IMPL_TYPE)
  require('./string.test').test(setup, IMPL_TYPE)
})
