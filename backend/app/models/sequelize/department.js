const Sequelize = require('sequelize');

const init = (sequelize) => {
  const Department = sequelize.define(
    'Department',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'department_id',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'department',
      freeTableName: true,
      timestamps: false,
    },
  );

  Department.authScope = async () => ({ where: {} });
};

module.exports = init;
