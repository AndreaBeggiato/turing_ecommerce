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
            charges: {
              create: jest.fn(async () => true),
            },
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

        test('Should increase order details count', async () => {
          const OrderDetail = sequelize.model('OrderDetail');
          const ShoppingCartRow = sequelize.model('ShoppingCartRow');
          const beforeCount = await OrderDetail.count();
          const beforeShoppingCartRow = await ShoppingCartRow
            .count({ where: { cartId: input.cartCode } });
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
          const afterCount = await OrderDetail.count();
          expect(beforeCount + beforeShoppingCartRow).toBe(afterCount);
        });

        test('Should remove shopping cart rows', async () => {
          const ShoppingCartRow = sequelize.model('ShoppingCartRow');
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

          const count = await ShoppingCartRow
            .count({ where: { cartId: input.cartCode } });
          expect(count).toBe(0);
        });
      });

      describe('Without correct input', () => {
        describe('With unexisting tax', () => {
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
            const firstCartRow = await factory.create('ShoppingCartRow');
            await factory.create('ShoppingCartRow', { cartId: firstCartRow.cartId, quantity: 2 });
            input = {
              cartCode: firstCartRow.cartId,
              taxId: toGlobalId('Tax', -1),
              token: 'stripeToken',
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
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
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('TAX_NOT_FOUND');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With empty cart', () => {
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
            input = {
              cartCode: 'empty_cart',
              taxId: toGlobalId('Tax', tax.id),
              token: 'stripeToken',
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
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
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('EMPTY_CART');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With empty customer', () => {
          let sequelize;
          let input;
          let stripeClient;
          let currentAuth;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            stripeClient = {
              charge: jest.fn(),
            };
            currentAuth = {
              email: 'fake@email.it',
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

          test('Should throw UserInputError with correct code', async () => {
            try {
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
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('EMPTY_CUSTOMER');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('Without complete customer address', () => {
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
            customer = await factory.create('Customer', { address1: null });
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

          test('Should throw UserInputError with correct code', async () => {
            try {
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
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('CUSTOMER_NEED_A_COMPLETE_ADDRESS');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With stripe error', () => {
          let sequelize;
          let customer;
          let input;
          let stripeClient;
          let currentAuth;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            stripeClient = {
              charges: {
                create: jest.fn(async () => {
                  throw new Error();
                }),
              },
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

          test('Should throw UserInputError with correct code', async () => {
            try {
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
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('PAYMENT_ERROR');
              return;
            }
            expect(true).toBe(false);
          });
        });
      });
    });
  });
});
