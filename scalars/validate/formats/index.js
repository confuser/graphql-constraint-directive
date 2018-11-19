const formats = [
  "byte",
  "date-time",
  "date",
  "email",
  "ipv4",
  "ipv6",
  "uri",
  "uuid"
];
const fns = {};

formats.forEach(format => {
  fns[format] = require("./" + format);
});

module.exports = fns;
