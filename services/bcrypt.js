const bcrypt = require("bcryptjs");

function generateHashPassword(pass) {
  return bcrypt.hashSync(pass, 10);
}

function comparePassword(password, anotherPassword) {
  return bcrypt.compareSync(password, anotherPassword);
}

module.exports = { generateHashPassword, comparePassword };
