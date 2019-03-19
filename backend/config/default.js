const path = require('path');

const config = {
  rootPath: path.join(__dirname, '..'),
  port: process.env.PORT,
  sequelize: {
    database: process.env.MYSQL_DATABASE,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    options: {
      dialect: 'mysql',
      host: process.env.MYSQL_HOST,
    },
  },
};

module.exports = config;
