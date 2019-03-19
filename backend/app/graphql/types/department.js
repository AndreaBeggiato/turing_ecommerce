const { toGlobalId } = require('graphql-relay');

const typeDefinition = `
  type Department implements Node {
    id: ID!
    name: String!
    description: String!
  }
`;

const resolver = {
  Department: {
    id: source => toGlobalId('Department', source.id),
    name: source => source.name,
    description: source => source.description,
  },
};

module.exports = { typeDefinition, resolver };
