const { createConnectionResolver } = require('graphql-sequelize');
const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { apply: applyProductFilter } = require('../filters/product');

const typeDefinition = `
  type Viewer {
    node(id: ID!): Node!
    departments: [Department!]!
    products(first: Int, last: Int, before: String, after: String, filter: ProductFilter): ProductConnection!
  }
`;

const resolver = {
  Viewer: {
    node: async (source, args, context) => {
      const { id } = args;
      const { dataloaders, guard, errorCodes } = context;
      const { type, id: realId } = fromGlobalId(id);
      if (type === 'Department') {
        if (await guard.allows('department.show')) {
          return dataloaders.default('Department').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      throw new ApolloError(errorCodes.generic.INVALID_TYPE, 'GENERIC', { type });
    },
    departments: async (source, args, context) => {
      const { sequelize, dataloaders } = context;
      const departments = await sequelize.model('Department').findAll();
      const ids = departments.map(r => r.id);
      ids.forEach(id => dataloaders.default('Department').prime(id, departments.find(r => r.id === id)));
      return dataloaders.default('Department').loadMany(ids);
    },
    products: async (source, args, context, info) => {
      const { sequelize, dataloaders, currentAuth } = context;
      const Product = sequelize.model('Product');
      const { resolveConnection } = createConnectionResolver({
        target: Product,
        before: async findOperation => ({
          ...findOperation,
          where: {
            ...(await Product.authScope(currentAuth)).where,
            ...(await applyProductFilter(args)).where,
          },
        }),
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
