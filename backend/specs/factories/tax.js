module.exports = async (factory, sequelize) => {
  const Tax = sequelize.model('Tax');
  factory.define(
    'Tax',
    Tax,
    {
      name: factory.seq('Tax.name', n => `Tax name ${n}`),
      percentage: 0.3,
    },
  );
};
