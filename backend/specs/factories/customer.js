module.exports = async (factory, sequelize) => {
  const Customer = sequelize.model('Customer');
  factory.define(
    'Customer',
    Customer,
    {
      name: factory.seq('Customer.name', n => `Customer name ${n}`),
      email: factory.seq('Customer.email', n => `example${n}@example.com`),
      password: 'FIELD_TO_REMOVE',
      address1: 'Address1',
      city: 'City',
      country: 'Country',
      postalCode: 'PostalCode',
      region: 'Region',
      shippingRegionId: factory.assoc('ShippingRegion', 'id'),
    },
  );
};
