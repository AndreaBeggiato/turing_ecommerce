const sequelizePromise = require('../../initializers/sequelize');
const factoryConfig = require('../factories');
// jest.setTimeout(30000);
//

beforeAll(async () => {
  const sequelize = await sequelizePromise;
  await sequelize.sync();
  await factoryConfig.init(sequelize);
});

afterEach(() => {
  factoryConfig.clear();
});
