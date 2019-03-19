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
      if (type === 'Product') {
        if (await guard.allows('product.show')) {
          return dataloaders.default('Product').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      if (type === 'Category') {
        if (await guard.allows('category.show')) {
          return dataloaders.default('Category').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      throw new ApolloError(errorCodes.generic.INVALID_TYPE, 'GENERIC', { type });
    },
    departments: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        errorCodes,
      } = context;
      const Department = sequelize.model('Department');
      if (await guard.allows('department.list')) {
        const departments = await Department.findAll({ attributes: ['id'] });
        const ids = departments.map(r => r.id);
        ids.forEach(id => dataloaders.default('Department').prime(id, departments.find(r => r.id === id)));
        return dataloaders.default('Department').loadMany(ids);
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
    products: async (source, args, context, info) => {
      const {
        sequelize,
        dataloaders,
        currentAuth,
        guard,
        errorCodes,
      } = context;
      const Product = sequelize.model('Product');
      if (await guard.allows('product.list')) {
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
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
