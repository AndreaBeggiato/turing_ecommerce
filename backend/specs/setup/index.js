const sequelizePromise = require('../../initializers/sequelize');
const factoryConfig = require('../factories');

beforeAll(async () => {
  const sequelize = await sequelizePromise;
  await sequelize.sync();
  await factoryConfig.init(sequelize);
});

afterEach(() => {
  factoryConfig.clear();
});
