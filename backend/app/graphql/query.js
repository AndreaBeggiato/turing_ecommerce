const typeDefinition = `
  type Query {
    """
    Entry point for all queries
    
    **Possible errors:**
      - Authentication
        - MISSING_AUTHORIZATION: Wrong authorization for the request
      - Generic
        - INVALID_TYPE: You specify an id of a type and request a different type (e.g. you specify a customer id and search for a product)
    """
    viewer: Viewer!
  }
`;

const resolver = {
  Query: {
    viewer: () => ({}),
  },
};

module.exports = { typeDefinition, resolver };
