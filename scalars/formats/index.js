const fns = {
  byte: require('./byte'),
  'date-time': require('./date-time'),
  date: require('./date'),
  email: require('./email'),
  ipv4: require('./ipv4'),
  ipv6: require('./ipv6'),
  uri: require('./uri'),
  uuid: require('./uuid')
}

module.exports = fns
