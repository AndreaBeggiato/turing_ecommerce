const typeDefinition = `
  interface Node {
    id: ID!
  }
`;

const resolver = {
  Node: {
    __resolveType(obj, context) {
      const { sequelize } = context;
      if (obj instanceof sequelize.model('Product')) {
        return 'Product';
      }
      if (obj instanceof sequelize.model('Department')) {
        return 'Department';
      }
      if (obj instanceof sequelize.model('Category')) {
        return 'Category';
      }
      if (obj instanceof sequelize.model('Attribute')) {
        return 'Attribute';
      }
      if (obj instanceof sequelize.model('AttributeValue')) {
        return 'AttributeValue';
      }
      if (obj instanceof sequelize.model('ShippingRegion')) {
        return 'ShippingRegion';
      }
      if (obj instanceof sequelize.model('Customer')) {
        return 'Customer';
      }
      return null;
    },
  },
};

module.exports = { typeDefinition, resolver };
