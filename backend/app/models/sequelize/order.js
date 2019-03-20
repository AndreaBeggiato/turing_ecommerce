const Sequelize = require('sequelize');

const init = (sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'order_id',
      },
      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdOn: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
        field: 'created_on',
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'customer_id',
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'shipping_id',
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      taxId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'tax_id',
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
        field: 'total_amount',
      },
    },
    {
      tableName: 'order',
      freeTableName: true,
      timestamps: false,
    },
  );

  Order.authScope = async () => ({ where: { } });
};

module.exports = init;
