const Sequelize = require('sequelize');

const init = (sequelize) => {
  sequelize.define(
    'Category',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'category_id',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'department_id',
      },
    },
    {
      tableName: 'category',
      freeTableName: true,
      timestamps: false,
    },
  );
};

module.exports = init;
