const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');
const errorCodes = require('../../../../errors/code');

const addProduct = require('../addProduct');

describe('Shopping Cart addProduct', () => {
  describe('#mutate', () => {
    describe('Without guard allows shopping cart row create', () => {
      let guard;
      beforeEach(() => {
        guard = {
          allows: jest.fn(),
        };
        guard.allows.mockReturnValueOnce(false);
      });

      test('Should call guard allows with correct args', async () => {
        try {
          await addProduct.mutate(null, { input: { } }, { guard, errorCodes });
        }
        catch(e) { } // eslint-disable-line
        finally {
          expect(guard.allows).toBeCalledWith('shoppingCartRow.create');
        }
      });

      test('Should throw AuthenticationError', async () => {
        try {
          await addProduct.mutate(null, { input: {} }, { guard, errorCodes });
        }
        catch (err) {
          expect(err).toBeInstanceOf(AuthenticationError);
          return;
        }
        expect(true).toBe(false);
      });
    });

    describe('With guard allows shopping cart row create', () => {
      let guard;
      beforeEach(() => {
        guard = {
          allows: jest.fn(),
        };
        guard.allows.mockReturnValueOnce(true);
      });

      test('Should call guard allows with correct args', async () => {
        try {
          await addProduct.mutate(null, { input: { } }, { guard, errorCodes });
        }
        catch (e) { } //eslint-disable-line
        finally {
          expect(guard.allows).toBeCalledWith('shoppingCartRow.create');
        }
      });

      describe('Without correct input', () => {
        describe('With too long cart code', () => {
          let input;
          beforeEach(() => {
            input = {
              cartCode: Array(100).fill('a').join(''),
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('CART_CODE_TOO_LONG');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With too low quantity', () => {
          let input;
          beforeEach(() => {
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 0,
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('QUANTITY_TOO_LOW');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With unexisting product id', () => {
          let input;
          let dataloaders;
          beforeEach(() => {
            dataloaders = {
              default: () => ({
                load: jest.fn(null),
              }),
            };
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 1,
              productId: toGlobalId('Product', 1),
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes, dataloaders });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('PRODUCT_NOT_FOUND');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe.only('With invalid attribute value id', () => {
          let input;
          let dataloaders;
          beforeEach(async () => {
            const product = await factory.create('Product');
            dataloaders = {
              default: () => ({
                load: jest.fn(() => product),
              }),
            };
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 1,
              productId: toGlobalId('Product', product.id),
              attributeValueIds: [toGlobalId('AttributeValue', 123)],
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes, dataloaders });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('ATTRIBUTE_VALUES_NOT_IN_PRODUCT');
              return;
            }
            expect(true).toBe(false);
          });
        });
      });
    });
  });
});
