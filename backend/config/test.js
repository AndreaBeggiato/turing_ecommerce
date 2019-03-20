const path = require('path');
const defer = require('config/defer').deferConfig;

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
  mail: {
    viewPath: defer(function root() {
      return path.resolve(this.rootPath, 'mailTemplates');
    }),
    from: 'noreply@geekcups.com',
    transporter: {
      jsonTransport: true,
    },
  },

};

module.exports = config;
