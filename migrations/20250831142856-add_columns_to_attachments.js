'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('attachments', 'created_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW'),
    });

    await queryInterface.addColumn('attachments', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW'),
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('attachments', 'created_at');
    await queryInterface.removeColumn('attachments', 'updated_at');
  }
};
