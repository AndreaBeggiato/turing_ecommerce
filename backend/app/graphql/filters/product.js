const Sequelize = require('sequelize');

const { Op } = Sequelize;

const typeDefinition = `
  input ProductFilter {
    """
    Text to search inside name and description
    """
    searchText: String
  }
`;

const apply = async (args) => {
  const filterClause = [];

  if (args.filter) {
    const { searchText } = args.filter;
    if (searchText) {
      filterClause.push({
        [Op.or]: [
          { name: { [Op.like]: `%${searchText}%` } },
          { description: { [Op.like]: `%${searchText}%` } },
        ],
      });
    }
  }

  return {
    where: {
      [Op.and]: filterClause,
    },
  };
};

module.exports = { apply, typeDefinition };
