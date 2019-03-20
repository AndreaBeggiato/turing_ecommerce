module.exports = async (factory, sequelize) => {
  const Order = sequelize.model('Order');
  factory.define(
    'Order',
    Order,
    {
      customerId: factory.assoc('Customer', 'id'),
      taxId: factory.assoc('Tax', 'id'),
      totalAmount: 123.45,
    },
  );
};
