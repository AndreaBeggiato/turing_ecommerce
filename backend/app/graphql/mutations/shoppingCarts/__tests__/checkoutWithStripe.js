const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const checkoutWithStripe = require('../checkoutWithStripe');

describe('Shopping Cart checkoutWithStripe', () => {
  describe('#mutate', () => {
    describe('Without guard allows order create', () => {
      let guard;
      beforeEach(() => {
        guard = {
          allows: jest.fn(),
        };
        guard.allows.mockReturnValueOnce(false);
      });

      test('Should call guard allows with correct args', async () => {
        try {
          await checkoutWithStripe.mutate(null, { input: { } }, { guard, errorCodes });
        }
        catch(e) { } // eslint-disable-line
        finally {
          expect(guard.allows).toBeCalledWith('order.create');
        }
      });

      test('Should throw AuthenticationError', async () => {
        try {
          await checkoutWithStripe.mutate(null, { input: {} }, { guard, errorCodes });
        }
        catch (err) {
          expect(err).toBeInstanceOf(AuthenticationError);
          return;
        }
        expect(true).toBe(false);
      });
    });

    describe('With guard allows order create', () => {
      let guard;
      beforeEach(() => {
        guard = {
          allows: jest.fn(),
        };
        guard.allows.mockReturnValueOnce(true);
      });

      test('Should call guard allows with correct args', async () => {
        try {
          await checkoutWithStripe.mutate(null, { input: { } }, { guard, errorCodes });
        }
        catch (e) { } //eslint-disable-line
        finally {
          expect(guard.allows).toBeCalledWith('order.create');
        }
      });

      // describe('With correct input', () => {
      // });
      //
      // describe('Without correct input', () => {
      // });
    });
  });
});
