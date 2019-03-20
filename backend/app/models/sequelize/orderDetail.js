const Sequelize = require('sequelize');

const init = (sequelize) => {
  const OrderDetail = sequelize.define(
    'OrderDetail',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'item_id',
      },
      attributes: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'order_id',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'product_id',
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'product_name',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'unit_cost',
      },
    },
    {
      tableName: 'shopping_cart',
      freeTableName: true,
      timestamps: false,
    },
  );

  OrderDetail.authScope = async () => ({ where: { } });
};

module.exports = init;
