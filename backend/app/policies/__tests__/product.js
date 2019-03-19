const { factory } = require('factory-girl'); // eslint-disable-line

const policy = require('../product');

describe('Product policy', () => {
  describe('#list', () => {
    test('Should return truthy', async () => {
      const result = await policy.methods.list();
      expect(result).toBeTruthy();
    });
  });

  describe('#show', () => {
    describe('without auth', () => {
      describe('without displayable product', () => {
        let product;
        beforeEach(async () => {
          product = await factory.create('Product', { display: 0 });
        });

        test('Should return falsy', async () => {
          const result = await policy.methods.show(null, product);
          expect(result).toBeFalsy();
        });
      });

      describe('with displayable product', () => {
        let product;
        beforeEach(async () => {
          product = await factory.create('Product', { display: 1 });
        });

        test('Should return truthy', async () => {
          const result = await policy.methods.show(null, product);
          expect(result).toBeTruthy();
        });
      });
    });

    describe('with anonymous auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => true),
        };
      });

      describe('without displayable product', () => {
        let product;
        beforeEach(async () => {
          product = await factory.create('Product', { display: 0 });
        });

        test('Should return falsy', async () => {
          const result = await policy.methods.show(auth, product);
          expect(result).toBeFalsy();
        });
      });

      describe('with displayable product', () => {
        let product;
        beforeEach(async () => {
          product = await factory.create('Product', { display: 1 });
        });

        test('Should return truthy', async () => {
          const result = await policy.methods.show(auth, product);
          expect(result).toBeTruthy();
        });
      });
    });

    describe('without anonymous auth', () => {
      let auth;

      beforeEach(() => {
        auth = {
          isAnonymous: jest.fn(() => false),
        };
      });

      describe('without displayable product', () => {
        let product;
        beforeEach(async () => {
          product = await factory.create('Product', { display: 0 });
        });

        test('Should return truthy', async () => {
          const result = await policy.methods.show(auth, product);
          expect(result).toBeTruthy();
        });
      });

      describe('with displayable product', () => {
        let product;
        beforeEach(async () => {
          product = await factory.create('Product', { display: 1 });
        });

        test('Should return truthy', async () => {
          const result = await policy.methods.show(auth, product);
          expect(result).toBeTruthy();
        });
      });
    });
  });
});
