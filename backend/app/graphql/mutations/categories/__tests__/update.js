const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const update = require('../update');

describe('Category update', () => {
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

      describe('Without guard allows category update', () => {
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
            expect(guard.allows).toBeCalledWith('category.update', expect.objectContaining({ id: category.id }));
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

      describe('With guard allows category update', () => {
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
            const department = await factory.create('Department');
            input.name = 'new name';
            input.departmentId = toGlobalId('Department', department.id);
          });

          test('Should call guard allows with correct args', async () => {
            await update.mutate(null, { input }, { guard, errorCodes, sequelize });
            expect(guard.allows).toBeCalledWith('category.update', expect.objectContaining({ id: category.id }));
          });

          test('Should update category', async () => {
            await update.mutate(null, { input }, { guard, errorCodes, sequelize });
            await category.reload();
            expect(category.name).toBe(input.name);
          });
        });

        describe('Without correct input', () => {
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
          });

          describe('With unexisting department', () => {
            beforeEach(async () => {
              sequelize = await sequelizePromise;
              input.name = 'new name';
              input.departmentId = toGlobalId('Department', -1);
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await update.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('DEPARTMENT_NOT_FOUND');
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
          await update.mutate(null, { input }, { errorCodes, sequelize });
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
