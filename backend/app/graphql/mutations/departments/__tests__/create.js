const { AuthenticationError } = require('apollo-server-express');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const create = require('../create');

describe('Department create', () => {
  describe('#mutate', () => {
    describe('Without guard allows department create', () => {
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
          expect(guard.allows).toBeCalledWith('department.create');
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

    describe('With guard allows department create', () => {
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
          input = {
            name: 'new name',
          };
        });

        test('Should call guard allows with correct args', async () => {
          await create.mutate(null, { input }, { guard, errorCodes, sequelize });
          expect(guard.allows).toBeCalledWith('department.create');
        });

        test('Should increase departments count', async () => {
          const Department = sequelize.model('Department');
          const beforeCount = await Department.count();
          await create.mutate(null, { input }, { guard, errorCodes, sequelize });
          const afterCount = await Department.count();
          expect(beforeCount + 1).toBe(afterCount);
        });
      });
    });
  });
});
