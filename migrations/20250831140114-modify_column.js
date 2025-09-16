'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('attachments', 'note_id');
    await queryInterface.addColumn('attachments', 'note_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('attachments', 'note_id');
    await queryInterface.addColumn('attachments', 'note_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
