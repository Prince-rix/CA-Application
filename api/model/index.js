const { sequelize } = require("../config/dbconnection");
const Registration = require("./registration");

const db = {
  sequelize,
  Registration,
};

module.exports = db;
