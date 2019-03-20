const { factory } = require('factory-girl'); // eslint-disable-line

const policy = require('../order');

describe('Order policy', () => {
  describe('#create', () => {
    describe('Without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.create();
        expect(result).toBeFalsy();
      });
    });

    describe('With anonymous auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAnonymous: jest.jn(() => true),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.create(currentAuth);
        expect(result).toBeFalsy();
      });
    });

    describe('Without anonymous auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAnonymous: jest.jn(() => false),
        };
      });

      test('Should return truthy', async () => {
        const result = await policy.methods.create(currentAuth);
        expect(result).toBeTruthy();
      });
    });
  });
});
