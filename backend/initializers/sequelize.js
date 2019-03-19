const Sequelize = require('sequelize');
const glob = require('glob');
const config = require('config');

const sequelizeConfig = config.get('sequelize');
const rootPath = config.get('rootPath');
const sequelizeModelFiles = glob.sync(`${rootPath}/app/models/sequelize/*.js`);

async function init() {
  const sequelize = new Sequelize(
    sequelizeConfig.database,
    sequelizeConfig.username,
    sequelizeConfig.password,
    {
      ...sequelizeConfig.options,
    },
  );

  // eslint-disable-next-line global-require, import/no-dynamic-require
  sequelizeModelFiles.forEach(file => require(file)(sequelize));
  return sequelize;
}

module.exports = init();
