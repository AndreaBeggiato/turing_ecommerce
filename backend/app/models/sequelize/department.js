const Sequelize = require('sequelize');

const init = (sequelize) => {
  sequelize.define(
    'Department',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'department_id',
      },
      name: Sequelize.STRING,
      description: Sequelize.STRING,
    },
    {
      tableName: 'department',
      freeTableName: true,
      timestamps: false,
    },
  );
};

module.exports = init;
