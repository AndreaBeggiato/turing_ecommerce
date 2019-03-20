const Sequelize = require('sequelize');

const init = (sequelize) => {
  const Tax = sequelize.define(
    'Tax',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'tax_id',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'tax_type',
      },
      percentage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'tax_percentage',
      },
    },
    {
      tableName: 'tax',
      freeTableName: true,
      timestamps: false,
    },
  );

  Tax.authScope = async () => ({ where: { } });
};

module.exports = init;
