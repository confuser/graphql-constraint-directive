const byte = require('./byte');
const time = require('./date-time');
const date = require('./date');
const email = require('./email');
const ipv4 = require('./ipv4');
const ipv6 = require('./ipv6');
const uri = require('./uri');
const uuid = require('./uuid');

fns = {
  byte,
  'date-time': time,
  date,
  email,
  ipv4,
  ipv6,
  uri,
  uuid
}

module.exports = fns
