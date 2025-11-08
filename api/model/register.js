// model/user_register.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbconnection");

const Registration = sequelize.define("Registration", {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  church_name: DataTypes.STRING,
  age: DataTypes.INTEGER,
  section: DataTypes.STRING,
  amount: DataTypes.INTEGER,
  currency: { type: DataTypes.STRING, defaultValue: "INR" },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  payment_provider: DataTypes.STRING,
  payment_id: DataTypes.STRING
}, {
  tableName: "registrations",
  underscored: true,
  timestamps: true
});

module.exports = Registration;
