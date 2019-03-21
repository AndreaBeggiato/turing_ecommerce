const config = require('config');
const glob = require('glob');
const stripe = require('stripe');
const { Guard } = require('@slynova/fence');
const { ApolloServer, gql } = require('apollo-server-express');
const query = require('../app/graphql/query');
const mutation = require('../app/graphql/mutation');
const expressPromise = require('./express');
const sequelizePromise = require('./sequelize');
const loggerPromise = require('./logger');
const mailerFunctionPromise = require('./nodemailer');
const dataloaders = require('../app/dataloaders');
const { decodeUser } = require('../app/utils/authentication');
const errorCodes = require('../app/errors/code');

const rootPath = config.get('rootPath');
const stripeConfig = config.get('stripe');

const stripeClient = stripe(stripeConfig.secretKey);

async function init() {
  const app = await expressPromise;
  const logger = await loggerPromise;
  const sequelize = await sequelizePromise;
  const mailerFunction = await mailerFunctionPromise;
  const interfaceFiles = glob.sync(`${rootPath}/app/graphql/interfaces/*.js`);
  const typeFiles = glob.sync(`${rootPath}/app/graphql/types/*.js`);
  const mutationFiles = glob.sync(`${rootPath}/app/graphql/mutations/**/*.js`);
  const inputFiles = glob.sync(`${rootPath}/app/graphql/inputs/**/*.js`);
  const scalarFiles = glob.sync(`${rootPath}/app/graphql/scalars/**/*.js`);
  const enumFiles = glob.sync(`${rootPath}/app/graphql/enums/**/*.js`);
  const filterFiles = glob.sync(`${rootPath}/app/graphql/filters/*.js`);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const interfaces = interfaceFiles.filter(i => !i.match(/__tests__/)).map(i => require(i));
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const types = typeFiles.filter(i => !i.match(/__tests__/)).map(t => require(t));
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mutations = mutationFiles.filter(i => !i.match(/__tests__/)).map(m => require(m));
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const inputs = inputFiles.filter(i => !i.match(/__tests__/)).map(i => require(i));
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const scalars = scalarFiles.filter(i => !i.match(/__tests__/)).map(i => require(i));
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const enums = enumFiles.filter(i => !i.match(/__tests__/)).map(i => require(i));
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const filters = filterFiles.filter(i => !i.match(/__tests__/)).map(i => require(i));

  const typeDefs = gql`
    ${query.typeDefinition}
    ${mutation.typeDefinition}
    ${interfaces.map(i => i.typeDefinition).join(' ')}
    ${scalars.map(i => i.typeDefinition).join(' ')}
    ${enums.map(i => i.typeDefinition).join(' ')}
    ${filters.filter(i => i.typeDefinition).map(i => i.typeDefinition).join(' ')}
    ${inputs.map(i => i.typeDefinition).join(' ')}
    ${types.map(t => t.typeDefinition).join(' ')}
    ${mutations.map(m => m.typeDefinition).join(' ')}
  `;

  const resolvers = [
    query.resolver,
    mutation.resolver,
    ...interfaces.map(i => i.resolver),
    ...types.map(t => t.resolver),
    ...scalars.map(s => s.resolver),
    ...enums.map(e => e.resolver),
  ].reduce((acc, resolver) => ({
    ...acc,
    ...resolver,
  }), {});

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    formatError: (error) => {
      logger.error(error);
      return error;
    },
    context: async ({ req }) => {
      let token;
      if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith('bearer')) {
        token = req.headers.authorization.slice(7);
      }
      const auth = await decodeUser(logger, token);

      const guard = Guard.setDefaultUser(auth);

      return {
        dataloaders: dataloaders(sequelize),
        currentAuth: auth,
        sequelize,
        guard,
        logger,
        errorCodes,
        stripeClient,
        mailer: mailerFunction(),
      };
    },
  });

  apolloServer.applyMiddleware({ app });

  return apolloServer;
}

module.exports = init();
