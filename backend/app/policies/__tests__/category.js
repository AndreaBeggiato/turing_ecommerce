const { factory } = require('factory-girl'); // eslint-disable-line

const policy = require('../category');

describe('Category policy', () => {
  describe('#list', () => {
    test('Should return truthy', async () => {
      const result = await policy.methods.list();
      expect(result).toBeTruthy();
    });
  });

  describe('#show', () => {
    test('Should return truthy', async () => {
      const result = await policy.methods.show();
      expect(result).toBeTruthy();
    });
  });

  describe('#create', () => {
    describe('Without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.create();
        expect(result).toBeFalsy();
      });
    });

    describe('With admin auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAdmin: jest.fn(() => true),
        };
      });

      test('Should return thruty', async () => {
        const result = await policy.methods.create(currentAuth);
        expect(result).toBeTruthy();
      });
    });

    describe('Without admin auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.create(currentAuth);
        expect(result).toBeFalsy();
      });
    });
  });

  describe('#update', () => {
    describe('Without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.update();
        expect(result).toBeFalsy();
      });
    });

    describe('With admin auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAdmin: jest.fn(() => true),
        };
      });

      test('Should return thruty', async () => {
        const result = await policy.methods.update(currentAuth);
        expect(result).toBeTruthy();
      });
    });

    describe('Without admin auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.update(currentAuth);
        expect(result).toBeFalsy();
      });
    });
  });

  describe('#destroy', () => {
    describe('Without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.destroy();
        expect(result).toBeFalsy();
      });
    });

    describe('With admin auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAdmin: jest.fn(() => true),
        };
      });

      test('Should return thruty', async () => {
        const result = await policy.methods.destroy(currentAuth);
        expect(result).toBeTruthy();
      });
    });

    describe('Without admin auth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.destroy(currentAuth);
        expect(result).toBeFalsy();
      });
    });
  });
});
