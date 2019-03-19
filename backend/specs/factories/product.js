module.exports = async (factory, sequelize) => {
  const Product = sequelize.model('Product');
  factory.define(
    'Product',
    Product,
    {
      description: factory.seq('Product.description', n => `Product description ${n}`),
      discountedPrice: 0,
      display: 1,
      primaryImage: 'primaryImage.jpg',
      secondaryImage: 'secondaryImage.jpg',
      name: factory.seq('Product.name', n => `Product name ${n}`),
      price: 123.45,
      thumbnail: 'thumbnail.jpg',
      categoryId: factory.assoc('Category', 'id'),
    },
  );
};
