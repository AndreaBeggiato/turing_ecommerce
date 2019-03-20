const init = (sequelize) => {
  const Product = sequelize.model('Product');
  const Department = sequelize.model('Department');
  const Category = sequelize.model('Category');
  const Attribute = sequelize.model('Attribute');
  const AttributeValue = sequelize.model('AttributeValue');
  const ShoppingCartRow = sequelize.model('ShoppingCartRow');
  const Customer = sequelize.model('ShippingRegion');
  const ShippingRegion = sequelize.model('ShippingRegion');

  const ProductCategory = sequelize.model('ProductCategory');
  const ProductAttributeValue = sequelize.model('ProductAttributeValue');

  Department.categoriesAssociation = Department.hasMany(Category, { foreignKey: 'departmentId', sourceKey: 'id' });
  Category.departmentAssociation = Category.belongsTo(Department, { foreignKey: 'departmentId', targetKey: 'id' });

  Product.categoriesAssociation = Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'productId' });
  Category.productsAssociation = Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'categoryId' });

  Attribute.attributeValuesAssociation = Attribute.hasMany(AttributeValue, { foreignKey: 'attributeId', sourceKey: 'id' });
  AttributeValue.attributeAssociation = AttributeValue.belongsTo(Attribute, { foreignKey: 'attributeId', targetKey: 'id' });

  Product.attributeValuesAssociation = Product.belongsToMany(AttributeValue, { through: ProductAttributeValue, foreignKey: 'productId' });
  AttributeValue.productsAssociation = AttributeValue.belongsToMany(Product, { through: ProductAttributeValue, foreignKey: 'attributeValueId' });

  ShoppingCartRow.productAssociation = ShoppingCartRow.belongsTo(Product, { foreignKey: 'product_id', targetKey: 'id' });

  Customer.shippingRegionAssociation = Customer.belongsTo(ShippingRegion, { foreignKey: 'shippingRegionId', targetKey: 'id' });
};

module.exports = init;
