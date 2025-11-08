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
      name: Sequelize.STRING,
      phone: Sequelize.STRING,
      church_name: Sequelize.STRING,
      age: Sequelize.INTEGER,
      section: Sequelize.STRING,
      amount: Sequelize.INTEGER,
      currency: { type: Sequelize.STRING, defaultValue: 'INR' },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      payment_provider: Sequelize.STRING,
      payment_id: Sequelize.STRING,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registrations');
  }
};
