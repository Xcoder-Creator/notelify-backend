'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('notes', {
      note_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,  // auto-generate random UUIDs
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_draft: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      pinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      bg_color: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      wallpaper: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('notes');
  }
};
