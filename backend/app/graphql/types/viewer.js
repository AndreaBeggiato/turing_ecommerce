const { createConnectionResolver } = require('graphql-sequelize');
const { Op } = require('sequelize');

const typeDefinition = `
  type Viewer {
    departments: [Department!]!
    products(first: Int, last: Int, before: String, after: String): ProductConnection!
  }
`;

const resolver = {
  Viewer: {
    departments: async (source, args, context) => {
      const { sequelize, dataloaders } = context;
      const departments = await sequelize.model('Department').findAll();
      const ids = departments.map(r => r.id);
      ids.forEach(id => dataloaders.default('Department').prime(id, departments.find(r => r.id === id)));
      return dataloaders.default('Department').loadMany(ids);
    },
    products: async (source, args, context, info) => {
      const { sequelize, dataloaders } = context;
      const { resolveConnection } = createConnectionResolver({
        target: sequelize.model('Product'),
        after: (result) => {
          const ids = result.edges.map(r => r.id);
          ids.forEach(id => dataloaders.default('Product').prime(id, result.edges.find(r => r.id === id)));
          return result;
        },
      });
      return resolveConnection(source, args, context, info);
    },
  },
};

module.exports = { typeDefinition, resolver };
