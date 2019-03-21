const { toGlobalId } = require('graphql-relay');

const typeDefinition = `
  type Tax implements Node {
    id: ID!
    name: String!
    percentage: Float!
  }
`;

const resolver = {
  Tax: {
    id: source => toGlobalId('Tax', source.id),
    name: source => source.name,
    percentage: source => source.percentage,
  },
};

module.exports = { typeDefinition, resolver };
