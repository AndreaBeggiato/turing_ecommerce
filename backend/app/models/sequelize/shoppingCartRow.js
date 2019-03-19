const Sequelize = require('sequelize');

const init = (sequelize) => {
  const ShoppingCartRow = sequelize.define(
    'ShoppingCartRow',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'item_id',
      },
      addedOn: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
        field: 'added_on',
      },
      attributes: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      buyNow: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
        field: 'buy_now',
      },
      cartId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'cart_id',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'product_id',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'shopping_cart',
      freeTableName: true,
      timestamps: false,
    },
  );

  ShoppingCartRow.authScope = async () => ({ where: { } });
};

module.exports = init;
