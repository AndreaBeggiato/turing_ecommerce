module.exports = async (factory, sequelize) => {
  const Department = sequelize.model('Department');
  factory.define(
    'Department',
    Department,
    {
      name: factory.seq('Department.name', n => `Department name ${n}`),
      description: factory.seq('Department.name', n => `Department description ${n}`),
    },
  );
};
