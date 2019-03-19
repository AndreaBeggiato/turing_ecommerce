const typeDefinition = `
  type Query {
    viewer: Viewer!
  }
`;

const resolver = {
  Query: {
    viewer: () => ({}),
  },
};

module.exports = { typeDefinition, resolver };
