const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');
const { createConnectionResolver } = require('graphql-sequelize');
const { apply: applyProductFilter } = require('../filters/product');

const typeDefinition = `
  type Category implements Node {
    id: ID!
    name: String!
    description: String!
    department: Department!
    products(first: Int, last: Int, before: String, after: String, filter: ProductFilter): ProductConnection!
  }
`;

const resolver = {
  Category: {
    id: source => toGlobalId('Category', source.id),
    name: source => source.name,
    description: source => source.description,
    department: async (source, args, context) => {
      const {
        dataloaders,
        guard,
        errorCodes,
      } = context;
      const department = await dataloaders.default('Department').load(source.departmentId);
      if (await guard.allows('department.show', department)) {
        return department;
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
      const Category = sequelize.model('Category');
      const Product = sequelize.model('Product');
      if (await guard.allows('product.list')) {
        const whereClause = {
          ...(await Product.authScope(currentAuth)).where,
          ...(await applyProductFilter(args)).where,
        };
        const { resolveConnection } = createConnectionResolver({
          target: Category.productsAssociation,
          before: async findOperation => ({
            ...findOperation,
            where: whereClause,
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
