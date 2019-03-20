const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const destroy = require('../destroy');

describe('Category destroy', () => {
  describe('#mutate', () => {
    describe('With existing category', () => {
      let category;
      let input;
      beforeEach(async () => {
        category = await factory.create('Category');
        input = {
          id: toGlobalId('Category', category.id),
        };
      });

      describe('Without guard allows category destroy', () => {
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
            expect(guard.allows).toBeCalledWith('category.destroy', expect.objectContaining({ id: category.id }));
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

      describe('With guard allows category destroy', () => {
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
            expect(guard.allows).toBeCalledWith('category.destroy', expect.objectContaining({ id: category.id }));
          });

          test('Should decrease categories count', async () => {
            const Category = sequelize.model('Category');
            const beforeCount = await Category.count();
            await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
            const afterCount = await Category.count();
            expect(beforeCount - 1).toBe(afterCount);
          });
        });

        describe('With incorrect input', () => {
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
          });

          describe('With category with products', () => {
            beforeEach(async () => {
              const product = await factory.create('Product');
              await product.addCategory(category);
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('CATEGORY_HAS_PRODUCTS');
                return;
              }
              expect(true).toBe(false);
            });
          });
        });
      });
    });

    describe('With unexisting category', () => {
      let input;
      let sequelize;
      beforeEach(async () => {
        sequelize = await sequelizePromise;
        input = {
          id: toGlobalId('Category', -1),
        };
      });

      test('Should throw UserInputError with correct code', async () => {
        try {
          await destroy.mutate(null, { input }, { errorCodes, sequelize });
        }
        catch (err) {
          expect(err).toBeInstanceOf(UserInputError);
          expect(err.message).toBe('CATEGORY_NOT_FOUND');
          return;
        }
        expect(true).toBe(false);
      });
    });
  });
});
