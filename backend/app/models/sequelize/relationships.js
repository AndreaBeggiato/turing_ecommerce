const init = (sequelize) => {
  const Product = sequelize.model('Product');
  const Department = sequelize.model('Department');
  const Category = sequelize.model('Category');

  const ProductCategory = sequelize.model('ProductCategory');

  Department.categoriesAssociation = Department.hasMany(Category, { foreignKey: 'departmentId', sourceKey: 'id' });
  Category.departmentAssociation = Category.belongsTo(Department, { foreignKey: 'departmentId', targetKey: 'id' });

  Product.categoriesAssociation = Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'product_id' });
  Category.productsAssociation = Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'category_id' });
};

module.exports = init;
