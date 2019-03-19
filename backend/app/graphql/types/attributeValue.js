const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type AttributeValue implements Node {
    id: ID!
    value: String!
    attribute: Attribute!
  }
`;

const resolver = {
  AttributeValue: {
    id: source => toGlobalId('AttributeValue', source.id),
    value: source => source.value,
    attribute: async (source, args, context) => {
      const {
        dataloaders,
        guard,
        errorCodes,
      } = context;
      const attribute = await dataloaders.default('Attribute').load(source.attributeId);
      if (await guard.allows('attribute.show', attribute)) {
        return attribute;
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
