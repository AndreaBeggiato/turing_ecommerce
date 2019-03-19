const typeDefinition = `
  type Department {
    name: String!
    description: String!
  }
`;

const resolver = {
  Department: {
    name: source => source.name,
    description: source => source.description,
  },
};

module.exports = { typeDefinition, resolver };
