'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user_accounts', 'login_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('user_accounts', 'lock_until', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_accounts', 'login_attempts');
    await queryInterface.removeColumn('user_accounts', 'lock_until');
  }
};
