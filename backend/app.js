const glob = require('glob');
const config = require('config');

const expressPromise = require('./initializers/express');
const loggerPromise = require('./initializers/logger');

const rootPath = config.get('rootPath');
const port = config.get('port');
const initializerFiles = glob.sync(`${rootPath}/initializers/*.js`);

// eslint-disable-next-line global-require, import/no-dynamic-require
const initializerPromises = initializerFiles.map(file => require(file));
Promise.all([expressPromise, loggerPromise, ...initializerPromises])
  .then(async (results) => {
    const [app, logger] = results;
    app.listen({ port }, () => {
      logger.info(`🚀 🚀 🚀 Backend ecommerce ready at ${port} 🚀 🚀 🚀 `);
    });
  })
  .catch((err) => {
    console.log(err); // eslint-disable-line;
  });
