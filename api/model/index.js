const { sequelize } = require("../config/dbconnection");
const Registration = require("./register");

const db = {
  sequelize,
  Registration,
};

module.exports = db;
