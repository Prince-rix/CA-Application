'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.createTable('registrations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      name: { type: Sequelize.STRING },
      email_id: { type: Sequelize.STRING },            
      phone: { type: Sequelize.STRING },
      church_name: { type: Sequelize.STRING },
      age: { type: Sequelize.INTEGER },
      section: { type: Sequelize.STRING },
      amount: { type: Sequelize.INTEGER },
      currency: { type: Sequelize.STRING, defaultValue: 'INR' },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },  // pending, success, failed
      payment_provider: { type: Sequelize.STRING },                 // razorpay
      payment_id: { type: Sequelize.STRING },
      razorpay_order_id: { type: Sequelize.STRING },
      razorpay_signature: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registrations');
  }
};
