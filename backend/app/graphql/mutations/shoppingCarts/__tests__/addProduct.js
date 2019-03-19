const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

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

      describe('With correct input', () => {
        describe('With unexisting shopping cart row', () => {
          let sequelize;
          let input;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            const product = await factory.create('Product');
            const attributeValue = await factory.create('AttributeValue');
            await product.setAttributeValues([
              attributeValue,
            ]);
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 1,
              productId: toGlobalId('Product', product.id),
              attributeValueIds: [
                toGlobalId('AttributeValue', attributeValue.id),
              ],
            };
          });

          test('Should increase shopping cart rows count', async () => {
            const ShoppingCartRow = sequelize.model('ShoppingCartRow');
            const beforeCount = await ShoppingCartRow.count();
            await addProduct.mutate(
              null,
              { input },
              {
                guard,
                errorCodes,
                sequelize,
              },
            );
            const afterCount = await ShoppingCartRow.count();
            expect(beforeCount + 1).toBe(afterCount);
          });
        });

        describe('With existing shopping cart row', () => {
          let sequelize;
          let input;
          let shoppingCartRow;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            shoppingCartRow = await factory.create('ShoppingCartRow');
            input = {
              cartCode: shoppingCartRow.cartId,
              quantity: 1,
              productId: toGlobalId('Product', shoppingCartRow.productId),
              attributeValueIds: [],
            };
          });

          test('Should not increase shopping cart rows count', async () => {
            const ShoppingCartRow = sequelize.model('ShoppingCartRow');
            const beforeCount = await ShoppingCartRow.count();
            await addProduct.mutate(
              null,
              { input },
              {
                guard,
                errorCodes,
                sequelize,
              },
            );
            const afterCount = await ShoppingCartRow.count();
            expect(beforeCount).toBe(afterCount);
          });

          test('Should update quantity', async () => {
            const beforeQuantity = shoppingCartRow.quantity;
            await addProduct.mutate(
              null,
              { input },
              {
                guard,
                errorCodes,
                sequelize,
              },
            );
            await shoppingCartRow.reload();
            const afterQuantity = shoppingCartRow.quantity;
            expect(beforeQuantity + 1).toBe(afterQuantity);
          });
        });
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

        describe('With unexisting product', () => {
          let input;
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 1,
              productId: toGlobalId('Product', -1),
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes, sequelize });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('PRODUCT_NOT_FOUND');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With invalid attribute value id', () => {
          let input;
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            const product = await factory.create('Product');
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 1,
              productId: toGlobalId('Product', product.id),
              attributeValueIds: [toGlobalId('AttributeValue', -1)],
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes, sequelize });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('ATTRIBUTE_VALUES_NOT_IN_PRODUCT');
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('With multiple attribute value with same attribute', () => {
          let input;
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
            const product = await factory.create('Product');
            const attribute = await factory.create('Attribute');
            const firstAttributeValue = await factory.create('AttributeValue', { attributeId: attribute.id });
            const secondAttributeValue = await factory.create('AttributeValue', { attributeId: attribute.id });
            await product.setAttributeValues([
              firstAttributeValue,
              secondAttributeValue,
            ]);
            input = {
              cartCode: Array(10).fill('a').join(''),
              quantity: 1,
              productId: toGlobalId('Product', product.id),
              attributeValueIds: [
                toGlobalId('AttributeValue', firstAttributeValue.id),
                toGlobalId('AttributeValue', secondAttributeValue.id),
              ],
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await addProduct.mutate(null, { input }, { guard, errorCodes, sequelize });
            }
            catch (err) {
              expect(err).toBeInstanceOf(UserInputError);
              expect(err.message).toBe('MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE');
              return;
            }
            expect(true).toBe(false);
          });
        });
      });
    });
  });
});
