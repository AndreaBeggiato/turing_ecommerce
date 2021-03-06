const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const destroy = require('../destroy');

describe('Department destroy', () => {
  describe('#mutate', () => {
    describe('With existing department', () => {
      let department;
      let input;
      beforeEach(async () => {
        department = await factory.create('Department');
        input = {
          id: toGlobalId('Department', department.id),
        };
      });

      describe('Without guard allows department destroy', () => {
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
            expect(guard.allows).toBeCalledWith('department.destroy', expect.objectContaining({ id: department.id }));
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

      describe('With guard allows department destroy', () => {
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
            expect(guard.allows).toBeCalledWith('department.destroy', expect.objectContaining({ id: department.id }));
          });

          test('Should decrease departments count', async () => {
            const Department = sequelize.model('Department');
            const beforeCount = await Department.count();
            await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
            const afterCount = await Department.count();
            expect(beforeCount - 1).toBe(afterCount);
          });
        });

        describe('With incorrect input', () => {
          let sequelize;
          beforeEach(async () => {
            sequelize = await sequelizePromise;
          });

          describe('With department with categories', () => {
            beforeEach(async () => {
              await factory.create('Category', { departmentId: department.id });
            });

            test('Should throw UserInputError with correct code', async () => {
              try {
                await destroy.mutate(null, { input }, { guard, errorCodes, sequelize });
              }
              catch (err) {
                expect(err).toBeInstanceOf(UserInputError);
                expect(err.message).toBe('DEPARTMENT_HAS_CATEGORIES');
                return;
              }
              expect(true).toBe(false);
            });
          });
        });
      });
    });

    describe('With unexisting department', () => {
      let input;
      let sequelize;
      beforeEach(async () => {
        sequelize = await sequelizePromise;
        input = {
          id: toGlobalId('Department', -1),
        };
      });

      test('Should throw UserInputError with correct code', async () => {
        try {
          await destroy.mutate(null, { input }, { errorCodes, sequelize });
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
