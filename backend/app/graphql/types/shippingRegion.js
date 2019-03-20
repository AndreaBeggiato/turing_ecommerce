const { toGlobalId } = require('graphql-relay');

const typeDefinition = `
  type ShippingRegion implements Node {
    id: ID!
    name: String!
  }
`;

const resolver = {
  ShippingRegion: {
    id: source => toGlobalId('ShippingRegion', source.id),
    name: source => source.name,
  },
};

module.exports = { typeDefinition, resolver };
