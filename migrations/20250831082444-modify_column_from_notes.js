'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('notes', 'finalized', 'is_draft');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('notes', 'is_draft', 'finalized');
  }
};
