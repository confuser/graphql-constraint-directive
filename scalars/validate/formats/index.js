const formats = [
  "byte",
  "date-time",
  "date",
  "email",
  "alpha",
  "alpha-numeric",
  "credit-card",
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
