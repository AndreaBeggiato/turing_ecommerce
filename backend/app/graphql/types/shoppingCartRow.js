const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type ShoppingCartRow {
    id: ID!
    product: Product!
    attributeValues: [AttributeValue!]!
    quantity: Int!
  }
`;

const resolver = {
  ShoppingCartRow: {
    id: source => toGlobalId('ShoppingCartRow', source.id),
    product: async (source, args, context) => {
      const {
        dataloaders,
        guard,
        errorCodes,
      } = context;

      const product = await dataloaders.default('Product').load(source.productId);

      if (await guard.allows('product.show', product)) {
        return product;
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
    attributeValues: async (source, args, context) => {
      const {
        dataloaders,
        guard,
        errorCodes,
      } = context;

      if (await guard.allows('attributeValues.list')) {
        const attributeValueIds = source.attributes.split(',')
          .filter(av => av.trim() !== '')
          .map(av => parseInt(av, 10));

        return dataloaders.default('AttributeValue').loadMany(attributeValueIds);
      }

      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
