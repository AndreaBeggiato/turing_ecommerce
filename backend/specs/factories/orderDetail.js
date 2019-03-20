module.exports = async (factory, sequelize) => {
  const OrderDetail = sequelize.model('OrderDetail');
  factory.define(
    'OrderDetail',
    OrderDetail,
    {
      orderId: factory.assoc('Order', 'id'),
      productId: factory.assoc('Product', 'id'),
      productName: factory.seq('OrderDetail.productName', n => `OrderDetail productName${n}`),
      attributes: '',
      quantity: 1,
      unitCost: 100,
    },
  );
};
