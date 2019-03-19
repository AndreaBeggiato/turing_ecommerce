const DataLoader = require('dataloader');
const sequalizeDataLoader = require('./sequalizeDataloader');

module.exports = (sequelize) => {
  const defaultLoaders = {};

  return {
    default: (modelName) => {
      if (!defaultLoaders[modelName]) {
        defaultLoaders[modelName] = new DataLoader((keys) => { // eslint-disable-line
          return sequalizeDataLoader(sequelize.model(modelName), keys);
        });
      }
      return defaultLoaders[modelName];
    },
  };
};
