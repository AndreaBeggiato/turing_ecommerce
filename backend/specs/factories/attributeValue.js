module.exports = async (factory, sequelize) => {
  const AttributeValue = sequelize.model('AttributeValue');
  factory.define(
    'AttributeValue',
    AttributeValue,
    {
      value: factory.seq('AttributeValue.value', n => `AttributeValue value ${n}`),
      attributeId: factory.assoc('Attribute', 'id'),
    },
  );
};
