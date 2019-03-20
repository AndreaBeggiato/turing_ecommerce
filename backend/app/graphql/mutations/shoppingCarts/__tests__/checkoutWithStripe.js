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

      describe('With correct input', () => {
        let sequelize;
        let customer;
        let input;
        let stripeClient;
        let currentAuth;
        beforeEach(async () => {
          sequelize = await sequelizePromise;
          stripeClient = {
            charge: jest.fn(),
          };
          customer = await factory.create('Customer');
          currentAuth = {
            email: customer.email,
          };
          const tax = await factory.create('Tax');
          const firstCartRow = await factory.create('ShoppingCartRow');
          await factory.create('ShoppingCartRow', { cartId: firstCartRow.cartId, quantity: 2 });
          input = {
            cartCode: firstCartRow.cartId,
            taxId: toGlobalId('Tax', tax.id),
            token: 'stripeToken',
          };
        });

        test('Should increase orders count', async () => {
          const Order = sequelize.model('Order');
          const beforeCount = await Order.count();
          await checkoutWithStripe.mutate(
            null,
            { input },
            {
              guard,
              errorCodes,
              sequelize,
              currentAuth,
              stripeClient,
            },
          );
          const afterCount = await Order.count();
          expect(beforeCount + 1).toBe(afterCount);
        });
      });
      //
      // describe('Without correct input', () => {
      // });
    });
  });
});
