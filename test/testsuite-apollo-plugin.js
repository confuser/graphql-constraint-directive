const setup = require('./setup-apollo-plugin')
const { IMPL_TYPE_SERVER_VALIDATOR } = require('./testutils')

const IMPL_TYPE = IMPL_TYPE_SERVER_VALIDATOR

describe('Server validator based implementation - Apollo plugin', function () {
  require('./introspection.test').test(setup, IMPL_TYPE)
  require('./argument.test').test(setup, IMPL_TYPE)
  require('./input-object.test').test(setup, IMPL_TYPE)

  // TODO uncomment and update tests once feature implemented
  // require('./array.test').test(setup, IMPL_TYPE)
  // require('./float.test').test(setup, IMPL_TYPE)
  // require('./int.test').test(setup, IMPL_TYPE)
  // require('./string.test').test(setup, IMPL_TYPE)
})
