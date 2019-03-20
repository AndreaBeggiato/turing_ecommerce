const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type ShoppingCart {
    id: ID!
    cartCode: String!
    rows: [ShoppingCartRow!]!
  }
`;

const resolver = {
  ShoppingCart: {
    id: source => toGlobalId('ShoppingCart', source),
    cartCode: source => source,
    rows: async (source, args, context) => {
      const {
        sequelize,
        currentAuth,
        guard,
        errorCodes,
      } = context;

      if (await guard.allows('shoppingCartRow.list')) {
        const Product = sequelize.model('Product');
        const ShoppingCartRow = sequelize.authScope('ShoppingCartRow');
        const shoppingCartRows = await ShoppingCartRow.findAll({
          where: {
            ...(await ShoppingCartRow.authScope(currentAuth)).where,
            cartId: source,
          },
          include: [{
            model: Product,
            where: (await Product.authScope(currentAuth)).where,
          }],
        });
        return shoppingCartRows;
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
