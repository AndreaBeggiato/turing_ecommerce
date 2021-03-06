const { factory } = require('factory-girl'); // eslint-disable-line

const policy = require('../attributeValue');

describe('Attribute policy', () => {
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
});
