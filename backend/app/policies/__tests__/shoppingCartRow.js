const { factory } = require('factory-girl'); // eslint-disable-line

const policy = require('../shoppingCartRow');

describe('Shopping Cart Row policy', () => {
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
    test('Should return truthy', async () => {
      const result = await policy.methods.create();
      expect(result).toBeTruthy();
    });
  });
});
