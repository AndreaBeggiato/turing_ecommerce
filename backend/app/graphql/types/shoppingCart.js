const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type ShoppingCart {
    id: ID!
    cartCode: String!
    rows: [ShoppingCartRow!]!
    totalAmount: Float!
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
        const ShoppingCartRow = sequelize.model('ShoppingCartRow');
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
    totalAmount: async (source, args, context) => {
      const {
        sequelize,
        currentAuth,
        guard,
        errorCodes,
      } = context;

      if (await guard.allows('shoppingCartRow.list')) {
        const Product = sequelize.model('Product');
        const ShoppingCartRow = sequelize.model('ShoppingCartRow');
        const shoppingCartRows = await ShoppingCartRow.findAll({
          where: {
            ...(await ShoppingCartRow.authScope(currentAuth)).where,
            buyNow: 1,
            cartId: source,
          },
          include: [{
            model: Product,
            where: (await Product.authScope(currentAuth)).where,
          }],
        });
        const rowSubTotals = await Promise.all(shoppingCartRows.map(async (scr) => {
          const product = await scr.getProduct();
          return (product.discountedPrice > 0 ? product.discountedPrice : product.price)
            * scr.quantity;
        }));
        return rowSubTotals.reduce((acc, item) => acc + item, 0);
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
