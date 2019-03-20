const { factory } = require('factory-girl'); // eslint-disable-line

const policy = require('../customer');

describe('Product policy', () => {
  describe('#list', () => {
    describe('without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.list();
        expect(result).toBeFalsy();
      });
    });

    describe('with anonymous auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => true),
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.list(auth);
        expect(result).toBeFalsy();
      });
    });

    describe('with admin auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAdmin: jest.fn(() => true),
        };
      });

      test('Should return truthy', async () => {
        const result = await policy.methods.list(auth);
        expect(result).toBeTruthy();
      });
    });

    describe('with auth', () => {
      let auth;
      beforeEach(() => {
        auth = {
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.list(auth);
        expect(result).toBeFalsy();
      });
    });
  });

  describe('#show', () => {
    describe('without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.show();
        expect(result).toBeFalsy();
      });
    });

    describe('with anonymous auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => true),
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.show(auth);
        expect(result).toBeFalsy();
      });
    });

    describe('with admin auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => false),
          isAdmin: jest.fn(() => true),
        };
      });

      test('Should return truthy', async () => {
        const result = await policy.methods.show(auth);
        expect(result).toBeTruthy();
      });
    });

    describe('with auth', () => {
      let auth;
      let customer;

      describe('with same email', () => {
        beforeEach(async () => {
          customer = await factory.create('Customer');
          auth = {
            email: customer.email,
            isAnonymous: jest.fn(() => false),
            isAdmin: jest.fn(() => false),
          };
        });

        test('Should return truthy', async () => {
          const result = await policy.methods.show(auth, customer);
          expect(result).toBeTruthy();
        });
      });

      describe('without same email', () => {
        beforeEach(async () => {
          customer = await factory.create('Customer');
          auth = {
            email: 'test@test.it',
            isAnonymous: jest.fn(() => false),
            isAdmin: jest.fn(() => false),
          };
        });

        test('Should return falsy', async () => {
          const result = await policy.methods.show(auth, customer);
          expect(result).toBeFalsy();
        });
      });
    });
  });

  describe('#update', () => {
    describe('without auth', () => {
      test('Should return falsy', async () => {
        const result = await policy.methods.update();
        expect(result).toBeFalsy();
      });
    });

    describe('with anonymous auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => true),
          isAdmin: jest.fn(() => false),
        };
      });

      test('Should return falsy', async () => {
        const result = await policy.methods.update(auth);
        expect(result).toBeFalsy();
      });
    });

    describe('with admin auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => false),
          isAdmin: jest.fn(() => true),
        };
      });

      test('Should return truthy', async () => {
        const result = await policy.methods.update(auth);
        expect(result).toBeTruthy();
      });
    });

    describe('with auth', () => {
      let auth;
      let customer;

      describe('with same email', () => {
        beforeEach(async () => {
          customer = await factory.create('Customer');
          auth = {
            isAnonymous: jest.fn(() => false),
            isAdmin: jest.fn(() => false),
            email: customer.email,
          };
        });

        test('Should return truthy', async () => {
          const result = await policy.methods.update(auth, customer);
          expect(result).toBeTruthy();
        });
      });

      describe('without same email', () => {
        beforeEach(async () => {
          customer = await factory.create('Customer');
          auth = {
            email: 'test@test.it',
            isAnonymous: jest.fn(() => false),
            isAdmin: jest.fn(() => false),
          };
        });

        test('Should return falsy', async () => {
          const result = await policy.methods.update(auth, customer);
          expect(result).toBeFalsy();
        });
      });
    });
  });
});
