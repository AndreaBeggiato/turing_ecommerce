const { toGlobalId } = require('graphql-relay');
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
  },
};

module.exports = { typeDefinition, resolver };
