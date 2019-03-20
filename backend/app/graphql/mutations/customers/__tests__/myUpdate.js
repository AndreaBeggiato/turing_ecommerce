const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const myUpdate = require('../myUpdate');

describe('Customer myUpdate', () => {
  describe('#mutate', () => {
    describe('Without currentAuth', () => {
      test('Should throw AuthenticationError', async () => {
        try {
          await myUpdate.mutate(null, { input: {} }, { });
        }
        catch (err) {
          expect(err).toBeInstanceOf(AuthenticationError);
          return;
        }
        expect(true).toBe(false);
      });
    });
  });
});
