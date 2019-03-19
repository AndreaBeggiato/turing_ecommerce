const factoryGirl = require('factory-girl'); //eslint-disable-line
const glob = require('glob');
const config = require('config');

const rootPath = config.get('rootPath');
const factoryFiles = glob.sync(`${rootPath}/specs/factories/*.js`).filter(file => !file.includes('index'));

const { factory } = factoryGirl;

const adapter = new factoryGirl.SequelizeAdapter();
factory.setAdapter(adapter);

async function init(sequelize) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const factoryPromises = factoryFiles.map(file => require(file)(factory, sequelize));
  await Promise.all(factoryPromises);
}

async function clear() {
  await factory.cleanUp();
}

module.exports = {
  init,
  clear,
};
