const Sequelize = require('sequelize');

const init = (sequelize) => {
  sequelize.define(
    'ProductCategory',
    {
      productId: {
        type: Sequelize.INTEGER,
        field: 'product_id',
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        field: 'category_id',
        allowNull: false,
      },
    },
    {
      tableName: 'product_category',
      freeTableName: true,
      timestamps: false,
    },
  );
};

module.exports = init;
