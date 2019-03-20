const path = require('path');
const defer = require('config/defer').deferConfig;

const config = {
  rootPath: path.join(__dirname, '..'),
  port: process.env.PORT,
  assetBaseUrl: 'https://fakecdn.base.url',
  sequelize: {
    database: process.env.MYSQL_DATABASE,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    options: {
      dialect: 'mysql',
      host: process.env.MYSQL_HOST,
    },
  },
  stripe: {
    secretKey: process.env.STIPRE_SECRET_KEY,
  },
  firebase: {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_X509_CERT_URL,
  },
  mail: {
    viewPath: defer(function root() {
      return path.resolve(this.rootPath, 'mailTemplates');
    }),
    from: 'noreply@geekcups.com',
    transporter: {
      host: process.env.MAIL_SMTP_URL,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_SMTP_USER,
        pass: process.env.MAIL_SMTP_PASSWORD,
      },
    },
  },
};

module.exports = config;
