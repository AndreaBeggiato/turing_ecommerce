const Sequelize = require('sequelize');

const init = (sequelize) => {
  const Attribute = sequelize.define(
    'Attribute',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'attribute_id',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'attribute',
      freeTableName: true,
      timestamps: false,
    },
  );

  Attribute.authScope = async () => ({ where: { } });
};

module.exports = init;
