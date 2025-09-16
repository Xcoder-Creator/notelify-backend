'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  },

  async down (queryInterface, Sequelize) {
    // Nothing
  }
};
