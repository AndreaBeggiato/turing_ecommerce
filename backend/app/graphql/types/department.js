const { toGlobalId } = require('graphql-relay');
const Sequelize = require('sequelize');
const { AuthenticationError } = require('apollo-server-express');
const { createConnectionResolver } = require('graphql-sequelize');
const { apply: applyProductFilter } = require('../filters/product');

const { Op } = Sequelize;

const typeDefinition = `
  type Department implements Node {
    id: ID!
    name: String!
    description: String!
    categories: [Category!]!
    products(first: Int, last: Int, before: String, after: String, filter: ProductFilter): ProductConnection!
  }
`;

const resolver = {
  Department: {
    id: source => toGlobalId('Department', source.id),
    name: source => source.name,
    description: source => source.description,
    categories: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        currentAuth,
        errorCodes,
      } = context;
      const Category = sequelize.model('Category');
      if (await guard.allows('category.list')) {
        const categories = await source.getCategories(await Category.authScope(currentAuth));
        categories.forEach(c => dataloaders.default('Category').prime(c.id, c));
        const availableCategoryPromises = categories.map(async (category) => {
          if (await guard.allows('category.show', category)) {
            return category;
          }
          return null;
        });
        return (await Promise.all(availableCategoryPromises)).filter(c => c);
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
      const Category = sequelize.model('Category');
      if (await guard.allows('product.list')) {
        const categories = await source.getCategories(await Category.authScope(currentAuth));
        const categoryIds = categories.map(c => c.id);
        const whereClause = {
          ...(await Product.authScope(currentAuth)).where,
          ...(await applyProductFilter(args)).where,
        };
        const { resolveConnection } = createConnectionResolver({
          target: Product,
          before: async findOperation => ({
            ...findOperation,
            where: whereClause,
            include: [{
              model: Category,
              where: {
                id: { [Op.in]: categoryIds },
              },
            }],
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
