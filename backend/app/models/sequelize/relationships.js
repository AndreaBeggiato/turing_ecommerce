const init = (sequelize) => {
  const Product = sequelize.model('Product');
  const Department = sequelize.model('Department');
  const Category = sequelize.model('Category');
  const Attribute = sequelize.model('Attribute');
  const AttributeValue = sequelize.model('AttributeValue');
  const ShoppingCartRow = sequelize.model('ShoppingCartRow');

  const ProductCategory = sequelize.model('ProductCategory');
  const ProductAttributeValue = sequelize.model('ProductAttributeValue');

  Department.categoriesAssociation = Department.hasMany(Category, { foreignKey: 'department_id', sourceKey: 'id' });
  Category.departmentAssociation = Category.belongsTo(Department, { foreignKey: 'department_id', targetKey: 'id' });

  Product.categoriesAssociation = Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'product_id' });
  Category.productsAssociation = Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'category_id' });

  Attribute.attributeValuesAssociation = Attribute.hasMany(AttributeValue, { foreignKey: 'attribute_id', sourceKey: 'id' });
  AttributeValue.attributeAssociation = AttributeValue.belongsTo(Attribute, { foreignKey: 'attribute_id', targetKey: 'id' });

  Product.attributeValuesAssociation = Product.belongsToMany(AttributeValue, { through: ProductAttributeValue, foreignKey: 'product_id' });
  AttributeValue.productsAssociation = AttributeValue.belongsToMany(Product, { through: ProductAttributeValue, foreignKey: 'attribute_value_id' });

  ShoppingCartRow.productAssociation = ShoppingCartRow.belongsTo(Product, { foreignKey: 'product_id', targetKey: 'id' });
};

module.exports = init;
