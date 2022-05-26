const byte = require('./byte')
const date = require('./date')
const dateTime = require('./date-time')
const email = require('./email')
const ipv4 = require('./ipv4')
const ipv6 = require('./ipv6')
const uri = require('./uri')
const uuid = require('./uuid')

module.exports = {
  byte,
  'date-time': dateTime,
  date,
  email,
  ipv4,
  ipv6,
  uri,
  uuid
}
