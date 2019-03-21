const Sequelize = require('sequelize');

const init = (sequelize) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'customer_id',
      },
      address1: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'address_1',
      },
      address2: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'address_2',
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      creditCard: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'credit_card',
      },
      dayPhone: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'day_phone',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      eveningPhone: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'eve_phone',
      },
      mobilePhone: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'mob_phone',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'postal_code',
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingRegionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'shipping_region_id',
      },
    },
    {
      tableName: 'customer',
      freeTableName: true,
      timestamps: false,
    },
  );

  Customer.prototype.hasCompleteAddress = function hasCompleteAddress() {
    return !!(
      (this.address1 && this.address1.trim() !== '')
      && (this.city && this.city.trim() !== '')
      && (this.country && this.country.trim() !== '')
      && (this.postalCode && this.postalCode.trim() !== '')
      && (this.region && this.region.trim() !== '')
    );
  };

  Customer.authScope = async (auth) => {
    if (!auth || auth.isAnonimous()) {
      return { where: { } };
    }
    return { where: { email: auth.email } };
  };
};

module.exports = init;
