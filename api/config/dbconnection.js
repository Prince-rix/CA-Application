const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,           // for AWS RDS
        rejectUnauthorized: false
      }
    }
  }
);

async function connectionDb() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

module.exports = { sequelize, connectionDb };
