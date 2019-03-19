const { Op } = require('sequelize');

const mapDataToHash = data => (
  data.reduce((acc, item) => {
    acc[item.id.toString()] = item;
    return acc;
  }, {})
);

const loader = async (model, ids) => {
  const data = await model.findAll({ where: { id: { [Op.in]: ids } } });
  const hash = mapDataToHash(data);
  return ids.map((id) => {
    if (hash[id.toString()]) {
      return hash[id.toString()];
    }
    return null;
  });
};

module.exports = loader;
