module.exports = async (factory, sequelize) => {
  const ShippingRegion = sequelize.model('ShippingRegion');
  factory.define(
    'ShippingRegion',
    ShippingRegion,
    {
      name: factory.seq('ShippingRegion.name', n => `ShippingRegion name ${n}`),
    },
  );
};
