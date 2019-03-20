const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const create = require('../create');

describe('Product create', () => {
  describe('#mutate', () => {
    describe('Without guard allows product create', () => {
      let guard;
      beforeEach(() => {
        guard = {
          allows: jest.fn(),
        };
        guard.allows.mockReturnValueOnce(false);
      });

      test('Should call guard allows with correct args', async () => {
        try {
          await create.mutate(null, { input: {} }, { guard, errorCodes });
        }
        catch(e) { } // eslint-disable-line
        finally {
          expect(guard.allows).toBeCalledWith('product.create');
        }
      });

      test('Should throw AuthenticationError', async () => {
        try {
          await create.mutate(null, { input: { } }, { guard, errorCodes });
        }
        catch (err) {
          expect(err).toBeInstanceOf(AuthenticationError);
          return;
        }
        expect(true).toBe(false);
      });
    });

    describe('With guard allows product create', () => {
      let guard;
      beforeEach(() => {
        guard = {
          allows: jest.fn(),
        };
        guard.allows.mockReturnValueOnce(true);
      });

      describe('With correct input', () => {
        let input;
        let sequelize;
        beforeEach(async () => {
          sequelize = await sequelizePromise;
          const categories = await factory.createMany('Category', 2);
          const attributeValues = await factory.createMany('AttributeValue', 2);
          input = {
            name: 'new name',
            price: 12,
            display: 0,
            categoryIds: categories.map(c => toGlobalId('Category', c.id)),
            attributeValueIds: attributeValues.map(c => toGlobalId('AttributeValue', c.id)),
          };
        });

        test('Should call guard allows with correct args', async () => {
          await create.mutate(null, { input }, { guard, errorCodes, sequelize });
          expect(guard.allows).toBeCalledWith('product.create');
        });

        test('Should increase categories count', async () => {
          const Product = sequelize.model('Product');
          const beforeCount = await Product.count();
          await create.mutate(null, { input }, { guard, errorCodes, sequelize });
          const afterCount = await Product.count();
          expect(beforeCount + 1).toBe(afterCount);
        });
      });

      describe('Without correct input', () => {
        let sequelize;
        let input;
        beforeEach(async () => {
          sequelize = await sequelizePromise;
        });

        describe('With unexisting category', () => {
          beforeEach(() => {
            input = {
              name: 'new name',
              price: 12,
              display: 0,
              categoryIds: [toGlobalId('Category', -1)],
              attributeValueIds: [],
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await create.mutate(null, { input }, { guard, errorCodes, sequelize });
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
              name: 'new name',
              price: 12,
              display: 0,
              categoryIds: [],
              attributeValueIds: [toGlobalId('AttributeValue', -1)],
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await create.mutate(null, { input }, { guard, errorCodes, sequelize });
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
});
