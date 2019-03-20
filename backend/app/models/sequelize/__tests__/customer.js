const { factory } = require('factory-girl'); // eslint-disable-line

describe('Customer model', () => {
  let customer;
  beforeEach(async () => {
    customer = await factory.create('Customer');
  });

  describe('#hasCompleteAddress', () => {
    describe('With address completed', () => {
      test('Should return truthy', () => {
        expect(customer.hasCompleteAddress()).toBeTruthy();
      });
    });

    describe('Without address1', () => {
      beforeEach(() => {
        customer.address1 = null;
      });

      test('Should return falsy', () => {
        expect(customer.hasCompleteAddress()).toBeFalsy();
      });
    });

    describe('Without city', () => {
      beforeEach(() => {
        customer.city = null;
      });

      test('Should return falsy', () => {
        expect(customer.hasCompleteAddress()).toBeFalsy();
      });
    });

    describe('Without country', () => {
      beforeEach(() => {
        customer.country = null;
      });

      test('Should return falsy', () => {
        expect(customer.hasCompleteAddress()).toBeFalsy();
      });
    });

    describe('Without postalCode', () => {
      beforeEach(() => {
        customer.postalCode = null;
      });

      test('Should return falsy', () => {
        expect(customer.hasCompleteAddress()).toBeFalsy();
      });
    });

    describe('Without region', () => {
      beforeEach(() => {
        customer.region = null;
      });

      test('Should return falsy', () => {
        expect(customer.hasCompleteAddress()).toBeFalsy();
      });
    });
  });
});
