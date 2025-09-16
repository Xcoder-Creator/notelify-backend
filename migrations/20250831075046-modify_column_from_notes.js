'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('notes', 'id', 'note_id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('notes', 'note_id', 'id');
  }
};
