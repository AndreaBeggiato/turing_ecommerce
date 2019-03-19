const Sequelize = require('sequelize');

const { Op } = Sequelize;

const init = (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'product_id',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      discountedPrice: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
        field: 'discounted_price',
      },
      display: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      primaryImage: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'image',
      },
      secondaryImage: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'image_2',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'discounted_price',
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'product',
      freeTableName: true,
      timestamps: false,
    },
  );

  Product.authScope = async (auth) => {
    if (!auth || !auth.isAnonymous()) {
      return {
        where: {
          display: { [Op.gt]: 0 },
        },
      };
    }
    return { where: {} };
  };
};

module.exports = init;
