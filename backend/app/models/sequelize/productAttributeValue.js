const Sequelize = require('sequelize');

const init = (sequelize) => {
  sequelize.define(
    'ProductAttributeValue',
    {
      attributeValueId: {
        type: Sequelize.INTEGER,
        field: 'attribute_value_id',
        allowNull: false,
      },
      productId: {
        type: Sequelize.INTEGER,
        field: 'product_id',
        allowNull: false,
      },
    },
    {
      tableName: 'product_attribute',
      freeTableName: true,
      timestamps: false,
    },
  );
};

module.exports = init;
