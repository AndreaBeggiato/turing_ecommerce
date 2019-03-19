module.exports = async (factory, sequelize) => {
  const Category = sequelize.model('Category');
  factory.define(
    'Category',
    Category,
    {
      name: factory.seq('Category.name', n => `Category name ${n}`),
      description: factory.seq('Category.description', n => `Category description ${n}`),
      departmentId: factory.assoc('Department', 'id'),
    },
  );
};
