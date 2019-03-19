module.exports = async (factory, sequelize) => {
  const Attribute = sequelize.model('Attribute');
  factory.define(
    'Attribute',
    Attribute,
    {
      name: factory.seq('Attribute.name', n => `Attribute name ${n}`),
    },
  );
};
