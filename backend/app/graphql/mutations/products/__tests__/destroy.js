const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const destroy = require('../destroy');

describe('Product destroy', () => {
  describe('#mutate', () => {
    describe('With existing product', () => {
      let product;
      let input;
      beforeEach(async () => {
        product = await factory.create('Product');
        input = {
          id: toGlobalId('Product', product.id),
        };
      });

      describe('Without guard allows product destroy', () => {
        let guard;
        let sequelize;
        beforeEach(async () => {
          sequelize = await sequelizePromise;
          guard = {
            allows: jest.fn(),
          };
          guard.allows.mockReturnValueOnce(false);
        });

        test('Should call guard allows with correct args', async () => {
          try {
            await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
          }
          catch(e) { } // eslint-disable-line
          finally {
            expect(guard.allows).toBeCalledWith('product.destroy', expect.objectContaining({ id: product.id }));
          }
        });

        test('Should throw AuthenticationError', async () => {
          try {
            await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
          }
          catch (err) {
            expect(err).toBeInstanceOf(AuthenticationError);
            return;
          }
          expect(true).toBe(false);
        });
      });

      describe('With guard allows product destroy', () => {
        let guard;
        beforeEach(() => {
          guard = {
            allows: jest.fn(),
          };
          guard.allows.mockReturnValueOnce(true);
        });

        describe('With correct input', () => {
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
          });

          test('Should call guard allows with correct args', async () => {
            await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
            expect(guard.allows).toBeCalledWith('product.destroy', expect.objectContaining({ id: product.id }));
          });

          test('Should decrease categories count', async () => {
            const Product = sequelize.model('Product');
            const beforeCount = await Product.count();
            await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
            const afterCount = await Product.count();
            expect(beforeCount - 1).toBe(afterCount);
          });
        });

        describe('With incorrect input', () => {
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
          });

          describe('With product with shopping cart rows', () => {
            beforeEach(async () => {
              await factory.create('ShoppingCartRow', { productId: product.id });
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('PRODUCT_HAS_CARTS');
                return;
              }
              expect(true).toBe(false);
            });
          });

          describe('With product with order details', () => {
            beforeEach(async () => {
              await factory.create('OrderDetail', { productId: product.id });
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('PRODUCT_HAS_ORDERS');
                return;
              }
              expect(true).toBe(false);
            });
          });
        });
      });
    });

    describe('With unexisting product', () => {
      let input;
      let sequelize;
      beforeEach(async () => {
        sequelize = await sequelizePromise;
        input = {
          id: toGlobalId('Product', -1),
        };
      });

      test('Should throw UserInputError with correct code', async () => {
        try {
          await destroy.mutate(null, { input }, { errorCodes, sequelize });
        }
        catch (err) {
          expect(err).toBeInstanceOf(UserInputError);
          expect(err.message).toBe('PRODUCT_NOT_FOUND');
          return;
        }
        expect(true).toBe(false);
      });
    });
  });
});
