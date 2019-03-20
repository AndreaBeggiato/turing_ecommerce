const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type Customer implements Node {
    id: ID!
    address1: String
    address2: String
    city: String
    country: String
    creditCard: String
    dayPhone: String
    email: String!
    eveningPhone: String
    mobilePhone: String
    name: String!
    postalCode: String
    region: String
    shippingRegion: ShippingRegion!,
  }
`;

const resolver = {
  ShippingRegion: {
    id: source => toGlobalId('Customer', source.id),
    address1: source => source.address1,
    address2: source => source.address2,
    city: source => source.city,
    country: source => source.country,
    creditCard: source => source.creditCard,
    dayPhone: source => source.dayPhone,
    email: source => source.email,
    eveningPhone: source => source.eveningPhone,
    mobilePhone: source => source.mobilePhone,
    name: source => source.name,
    postalCode: source => source.postalCode,
    region: source => source.region,
    shippingRegion: async (source, args, context) => {
      const { dataloaders, guard, errorCodes } = context;
      const shippingRegion = await source.getShippingRegion();
      dataloaders.default('ShippingRegion').prime(shippingRegion.id, shippingRegion);
      if (await guard.allow('shippingRegion.show', shippingRegion)) {
        return shippingRegion;
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
