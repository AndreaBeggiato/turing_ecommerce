module.exports = async (factory, sequelize) => {
  const ShoppingCartRow = sequelize.model('ShoppingCartRow');
  factory.define(
    'ShoppingCartRow',
    ShoppingCartRow,
    {
      addedOn: new Date(),
      attributes: '',
      buyNow: 1,
      cartId: factory.seq('ShoppingCartRow.cartId', n => `CartId${n}`),
      productId: factory.assoc('Product', 'id'),
      quantity: 1,
    },
  );
};
