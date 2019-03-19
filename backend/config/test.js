const path = require('path');

const config = {
  rootPath: path.join(__dirname, '..'),
  port: 3000,
  sequelize: {
    database: 'db',
    username: 'user',
    password: 'password',
    options: {
      dialect: 'sqlite',
      logging: false,
    },
  },
};

module.exports = config;
