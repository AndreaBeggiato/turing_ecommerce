const sequelizePromise = require('../../initializers/sequelize');
const factoryConfig = require('../factories');

beforeAll(async () => {
  const sequelize = await sequelizePromise;
  await sequelize.sync({ force: true });
  await factoryConfig.init(sequelize);
});

afterEach(async () => {
  factoryConfig.clear();
});
