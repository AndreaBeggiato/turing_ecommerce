const Sequelize = require('sequelize');

const init = (sequelize) => {
  sequelize.define(
    'Product',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'product_id',
      },
      name: Sequelize.STRING,
      description: Sequelize.STRING,
    },
    {
      tableName: 'product',
      freeTableName: true,
      timestamps: false,
    },
  );
};

module.exports = init;
