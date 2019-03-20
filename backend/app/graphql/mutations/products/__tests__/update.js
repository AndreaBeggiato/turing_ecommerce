const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const update = require('../update');

describe('Product update', () => {
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

      describe('Without guard allows product update', () => {
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
            await update.mutate(null, { input }, { guard, errorCodes, sequelize });
          }
          catch(e) { } // eslint-disable-line
          finally {
            expect(guard.allows).toBeCalledWith('product.update', expect.objectContaining({ id: product.id }));
          }
        });

        test('Should throw AuthenticationError', async () => {
          try {
            await update.mutate(null, { input }, { guard, errorCodes, sequelize });
          }
          catch (err) {
            expect(err).toBeInstanceOf(AuthenticationError);
            return;
          }
          expect(true).toBe(false);
        });
      });

      describe('With guard allows product update', () => {
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
            const categories = await factory.createMany('Category', 2);
            const attributeValues = await factory.createMany('AttributeValue', 2);
            input = {
              id: toGlobalId('Product', product.id),
              name: 'new name',
              price: 12,
              display: 0,
              categoryIds: categories.map(c => toGlobalId('Category', c.id)),
              attributeValueIds: attributeValues.map(c => toGlobalId('AttributeValue', c.id)),
            };
          });

          test('Should call guard allows with correct args', async () => {
            await update.mutate(null, { input }, { guard, errorCodes, sequelize });
            expect(guard.allows).toBeCalledWith('product.update', expect.objectContaining({ id: product.id }));
          });

          test('Should update product', async () => {
            await update.mutate(null, { input }, { guard, errorCodes, sequelize });
            await product.reload();
            expect(product.name).toBe(input.name);
          });
        });

        describe('Without correct input', () => {
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
          });

          describe('With unexisting category', () => {
            beforeEach(() => {
              input = {
                id: toGlobalId('Product', product.id),
                name: 'new name',
                price: 12,
                display: 0,
                categoryIds: [toGlobalId('Category', -1)],
                attributeValueIds: [],
              };
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await update.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('CATEGORY_NOT_FOUND');
                return;
              }
              expect(true).toBe(false);
            });
          });

          describe('With unexisting attribute value', () => {
            beforeEach(() => {
              input = {
                id: toGlobalId('Product', product.id),
                name: 'new name',
                price: 12,
                display: 0,
                categoryIds: [],
                attributeValueIds: [toGlobalId('AttributeValue', -1)],
              };
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await update.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('ATTRIBUTE_VALUE_NOT_FOUND');
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
          await update.mutate(null, { input }, { errorCodes, sequelize });
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
