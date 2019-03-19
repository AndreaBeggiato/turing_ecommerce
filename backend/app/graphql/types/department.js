const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type Department implements Node {
    id: ID!
    name: String!
    description: String!
    categories: [Category!]!
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
        errorCodes,
      } = context;
      if (await guard.allows('category.list')) {
        const Category = sequelize.model('Category');
        const categories = await Category.findAll({ departmentId: source.id });
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
  },
};

module.exports = { typeDefinition, resolver };
