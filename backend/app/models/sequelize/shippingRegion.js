const Sequelize = require('sequelize');

const init = (sequelize) => {
  const ShippingRegion = sequelize.define(
    'ShippingRegion',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'shipping_region_id',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'shipping_region',
      },
    },
    {
      tableName: 'shipping_region',
      freeTableName: true,
      timestamps: false,
    },
  );

  ShippingRegion.authScope = async () => ({ where: { } });
};

module.exports = init;
