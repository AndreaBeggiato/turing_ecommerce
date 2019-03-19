const { fromGlobalId } = require('graphql-relay');

const typeDefinition = `
  input ProductFilter {
    searchText: String
  }
`;
const apply = async (query, args, context, extraArgs) => {
  const { hotelId } = extraArgs;

  if (hotelId) {
    query.and({
      hotel: hotelId,
    });
  }

  if (args.filter) {
    const { filter } = args;
    if (filter.search) {
      query.and({
        $or: [
          { name: new RegExp(filter.search, 'i') },
          { code: new RegExp(filter.search, 'i') },
        ],
      });
    }
    if (filter.default != null) {
      if (filter.default) {
        query.and({
          defaultPrice: { $ne: null },
          defaultPriceMode: { $ne: null },
        });
      }
      else {
        query.and({
          defaultPrice: null,
          defaultPriceMode: null,
        });
      }
    }
    if (filter.excludeIds && filter.excludeIds.length) {
      const realIds = filter.excludeIds.map(id => fromGlobalId(id).id);
      query.and({
        _id: { $nin: realIds },
      });
    }
  }

  return { query };
};

module.exports = { apply, typeDefinition };
