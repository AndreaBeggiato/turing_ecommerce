const { toGlobalId } = require('graphql-relay');

const typeDefinition = `
  type Attribute implements Node {
    id: ID!
    name: String!
  }
`;

const resolver = {
  Attribute: {
    id: source => toGlobalId('Attribute', source.id),
    name: source => source.name,
  },
};

module.exports = { typeDefinition, resolver };
