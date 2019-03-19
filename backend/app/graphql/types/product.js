const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');
const config = require('config');

const assetBaseUrl = config.get('assetBaseUrl');

const typeDefinition = `
  type Product implements Node {
    id: ID!,
    name: String!
    description: String!
    price: Float!
    originalPrice: Float!
    primaryImageUrl: String
    secondaryImageUrl: String
    thumbnailImageUrl: String
    attributeValues: [AttributeValue!]!
  }
`;

const resolver = {
  Product: {
    id: source => toGlobalId('Product', source.id),
    name: source => source.name,
    description: source => source.name,
    price: source => source.discountedPrice,
    originalPrice: source => source.price - source.discountedPrice,
    primaryImageUrl: source => (source.primaryImage ? `${assetBaseUrl}/images/${source.primaryImage}` : null),
    secondaryImageUrl: source => (source.secondaryImage ? `${assetBaseUrl}/images/${source.secondaryImage}` : null),
    thumbnailImageUrl: source => (source.thumbnailImage ? `${assetBaseUrl}/images/${source.thumbnailImage}` : null),
    attributeValues: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        currentAuth,
        errorCodes,
      } = context;
      if (await guard.allows('attributeValue.list')) {
        const Attribute = sequelize.model('Attribute');
        const AttributeValue = sequelize.model('AttributeValue');
        const attributeValues = await source.getAttributeValues({
          where: (await AttributeValue.authScope(currentAuth)).where,
          include: [{
            model: Attribute,
            where: (await Attribute.authScope(currentAuth)).where,
          }],
        });
        attributeValues.forEach(av => dataloaders.default('AttributeValue').prime(av.id, av));
        return attributeValues;
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
