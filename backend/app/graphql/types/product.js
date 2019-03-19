const typeDefinition = `
  type Product {
    name: String!
  }
`;

const resolver = {
  Product: {
    name: source => source.name,
  },
};

module.exports = { typeDefinition, resolver };
