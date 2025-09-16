'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('attachments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      note_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  }
};
