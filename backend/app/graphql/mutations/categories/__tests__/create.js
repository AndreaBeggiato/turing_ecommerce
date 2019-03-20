const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const create = require('../create');

describe('Category create', () => {
  describe('#mutate', () => {
    describe('Without guard allows category create', () => {
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
          expect(guard.allows).toBeCalledWith('category.create');
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

    describe('With guard allows category create', () => {
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
          const department = await factory.create('Department');
          input = {
            name: 'new name',
            departmentId: toGlobalId('Department', department.id),
          };
        });

        test('Should call guard allows with correct args', async () => {
          await create.mutate(null, { input }, { guard, errorCodes, sequelize });
          expect(guard.allows).toBeCalledWith('category.create');
        });

        test('Should increase categories count', async () => {
          const Category = sequelize.model('Category');
          const beforeCount = await Category.count();
          await create.mutate(null, { input }, { guard, errorCodes, sequelize });
          const afterCount = await Category.count();
          expect(beforeCount + 1).toBe(afterCount);
        });
      });

      describe('Without correct input', () => {
        let sequelize;
        let input;
        beforeEach(async () => {
          sequelize = await sequelizePromise;
        });

        describe('With unexisting department', () => {
          beforeEach(() => {
            input = {
              name: 'new name',
              departmentId: toGlobalId('Department', -1),
            };
          });

          test('Should throw UserInputError with correct code', async () => {
            try {
              await create.mutate(null, { input }, { guard, errorCodes, sequelize });
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
});
