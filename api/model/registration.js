const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbconnection");

const Registration = sequelize.define(
  "Registration",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    church_name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    section: DataTypes.STRING,
    amount: { type: DataTypes.INTEGER, defaultValue: 250 }, // fixed 250
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    status: { type: DataTypes.STRING, defaultValue: "pending" }, // pending, success, failed
    payment_provider: DataTypes.STRING,
    payment_id: DataTypes.STRING,
    email_id: DataTypes.STRING,
    // new fields for Razorpay
    razorpay_order_id: DataTypes.STRING,
    razorpay_signature: DataTypes.STRING,
  },
  {
    tableName: "registrations",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Registration;
