const { Gate } = require('@slynova/fence');
const glob = require('glob');
const config = require('config');

const rootPath = config.get('rootPath');
const policyFiles = glob.sync(`${rootPath}/app/policies/*.js`);

async function init() {
  policyFiles.forEach((file) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const policy = require(file);
    const methods = Object.keys(policy.methods);
    methods.forEach(method => Gate.define(`${policy.name}.${method}`, policy.methods[method]));
  });
}

module.exports = init();
