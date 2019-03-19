const Sequelize = require('sequelize');

const init = (sequelize) => {
  const AttributeValue = sequelize.define(
    'AttributeValue',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'attribute_value_id',
      },
      attributeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'attribute_id',
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'attribute_value',
      freeTableName: true,
      timestamps: false,
    },
  );

  AttributeValue.authScope = async () => ({ where: { } });
};

module.exports = init;
