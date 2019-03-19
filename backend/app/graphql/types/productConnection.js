const typeDefinition = `
  type ProductConnection {
    edges: [ProductEdge]
    pageInfo: PageInfo!
    total: Int!
  }

  type ProductEdge {
    cursor: String!
    node: Product
  }
`;

const resolver = {
  ProductConnection: {
    edges: source => source.edges,
    pageInfo: source => source.pageInfo,
    total: source => source.fullCount,
  },
  ProductEdge: {
    cursor: source => source.cursor,
    node: source => source.node,
  },
};


module.exports = { typeDefinition, resolver };
