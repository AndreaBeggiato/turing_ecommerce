const typeDefinition = `
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

const resolver = {
  PageInfo: {
    hasNextPage: source => source.hasNextPage,
    hasPreviousPage: source => source.hasPreviousPage,
    startCursor: source => source.startCursor,
    endCursor: source => source.endCursor,
  },
};


module.exports = { typeDefinition, resolver };
