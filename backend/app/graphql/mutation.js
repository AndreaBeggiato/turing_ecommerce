const typeDefinition = `
  type Mutation {
    hello(input: String!): String!
}
`;

const resolver = {
  Mutation: {
    hello: () => 'hey',
  },
};


module.exports = { typeDefinition, resolver };
