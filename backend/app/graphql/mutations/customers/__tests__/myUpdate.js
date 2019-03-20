const { factory } = require('factory-girl');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { toGlobalId } = require('graphql-relay');

const errorCodes = require('../../../../errors/code');
const sequelizePromise = require('../../../../../initializers/sequelize');

const myUpdate = require('../myUpdate');

describe('Customer myUpdate', () => {
  describe('#mutate', () => {
    describe('Without currentAuth', () => {
      test('Should throw AuthenticationError', async () => {
        try {
          await myUpdate.mutate(null, { input: {} }, { errorCodes });
        }
        catch (err) {
          expect(err).toBeInstanceOf(AuthenticationError);
          return;
        }
        expect(true).toBe(true);
      });
    });

    describe('With anonymous currentAuth', () => {
      let currentAuth;
      beforeEach(() => {
        currentAuth = {
          isAnonymous: jest.fn(() => true),
        };
      });
      test('Should throw AuthenticationError', async () => {
        try {
          await myUpdate.mutate(null, { input: {} }, { currentAuth, errorCodes });
        }
        catch (err) {
          expect(err).toBeInstanceOf(AuthenticationError);
          return;
        }
        expect(true).toBe(true);
      });
    });

    describe.only('With currentAuth', () => {
      let sequelize;
      let currentAuth;
      beforeEach(async () => {
        sequelize = await sequelizePromise;
        currentAuth = {
          isAnonymous: jest.fn(() => false),
          email: 'test@test.it',
        };
      });

      describe('Without existing customer', () => {
        describe('Without guard allows customer update', () => {
          let guard;
          beforeEach(() => {
            guard = {
              allows: jest.fn(),
            };
            guard.allows.mockReturnValueOnce(false);
          });

          test('Should call guard allows with correct args', async () => {
            try {
              await myUpdate.mutate(null, { input: {} }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
            }
            catch(e) { } // eslint-disable-line
            finally {
              expect(guard.allows).toBeCalledWith(
                'customer.update',
                expect.objectContaining({ email: currentAuth.email }),
              );
            }
          });

          test('Should throw AuthenticationError', async () => {
            try {
              await myUpdate.mutate(null, { input: {} }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
            }
            catch (err) {
              expect(err).toBeInstanceOf(AuthenticationError);
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('Without guard allows customer update', () => {
          let guard;
          beforeEach(() => {
            guard = {
              allows: jest.fn(),
            };
            guard.allows.mockReturnValueOnce(true);
          });

          test('Should call guard allows with correct args', async () => {
            try {
              await myUpdate.mutate(null, { input: {} }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
            }
            catch (e) { } //eslint-disable-line
            finally {
              expect(guard.allows).toBeCalledWith(
                'customer.update',
                expect.objectContaining({ email: currentAuth.email }),
              );
            }
          });

          describe('With correct input', () => {
            let input;
            beforeEach(async () => {
              const shippingRegion = await factory.create('ShippingRegion');
              input = {
                name: 'New name',
                shippingRegionId: toGlobalId('ShippingRegion', shippingRegion.id),
              };
            });

            test('Should increase customers count', async () => {
              const Customer = sequelize.model('Customer');
              const beforeCount = await Customer.count();
              await myUpdate.mutate(null, { input }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
              const afterCount = await Customer.count();
              expect(beforeCount + 1).toBe(afterCount);
            });
          });

          describe('Without correct input', () => {
            describe('With unexisting shipping region', () => {
              let input;
              beforeEach(() => {
                input = {
                  name: 'New name',
                  shippingRegionId: toGlobalId('ShippingRegion', -1),
                };
              });

              test('Should throw UserInputError with correct code', async () => {
                try {
                  await myUpdate.mutate(null, { input }, {
                    sequelize,
                    guard,
                    errorCodes,
                    currentAuth,
                  });
                }
                catch (err) {
                  expect(err).toBeInstanceOf(UserInputError);
                  expect(err.message).toBe('SHIPPING_REGION_NOT_FOUND');
                  return;
                }
                expect(true).toBe(false);
              });
            });
          });
        });
      });

      describe('With existing customer', () => {
        let customer;
        beforeEach(async () => {
          customer = await factory.create('Customer');
          currentAuth.email = customer.email;
        });

        describe('Without guard allows customer update', () => {
          let guard;
          beforeEach(() => {
            guard = {
              allows: jest.fn(),
            };
            guard.allows.mockReturnValueOnce(false);
          });

          test('Should call guard allows with correct args', async () => {
            try {
              await myUpdate.mutate(null, { input: {} }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
            }
            catch(e) { } // eslint-disable-line
            finally {
              expect(guard.allows).toBeCalledWith(
                'customer.update',
                expect.objectContaining({ email: currentAuth.email }),
              );
            }
          });

          test('Should throw AuthenticationError', async () => {
            try {
              await myUpdate.mutate(null, { input: {} }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
            }
            catch (err) {
              expect(err).toBeInstanceOf(AuthenticationError);
              return;
            }
            expect(true).toBe(false);
          });
        });

        describe('Without guard allows customer update', () => {
          let guard;
          beforeEach(() => {
            guard = {
              allows: jest.fn(),
            };
            guard.allows.mockReturnValueOnce(true);
          });

          test('Should call guard allows with correct args', async () => {
            try {
              await myUpdate.mutate(null, { input: {} }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
            }
            catch (e) { } //eslint-disable-line
            finally {
              expect(guard.allows).toBeCalledWith(
                'customer.update',
                expect.objectContaining({ email: currentAuth.email }),
              );
            }
          });

          describe('With correct input', () => {
            let input;
            beforeEach(async () => {
              const shippingRegion = await factory.create('ShippingRegion');
              input = {
                name: 'New name',
                shippingRegionId: toGlobalId('ShippingRegion', shippingRegion.id),
              };
            });

            test('Should not increase customers count', async () => {
              const Customer = sequelize.model('Customer');
              const beforeCount = await Customer.count();
              await myUpdate.mutate(null, { input }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
              const afterCount = await Customer.count();
              expect(beforeCount).toBe(afterCount);
            });

            test('Should update existing customer', async () => {
              await myUpdate.mutate(null, { input }, {
                sequelize,
                guard,
                errorCodes,
                currentAuth,
              });
              await customer.reload();
              const afterName = customer.name;
              expect(afterName).toBe(input.name);
            });
          });

          describe('Without correct input', () => {
            describe('With unexisting shipping region', () => {
              let input;
              beforeEach(() => {
                input = {
                  name: 'New name',
                  shippingRegionId: toGlobalId('ShippingRegion', -1),
                };
              });

              test('Should throw UserInputError with correct code', async () => {
                try {
                  await myUpdate.mutate(null, { input }, {
                    sequelize,
                    guard,
                    errorCodes,
                    currentAuth,
                  });
                }
                catch (err) {
                  expect(err).toBeInstanceOf(UserInputError);
                  expect(err.message).toBe('SHIPPING_REGION_NOT_FOUND');
                  return;
                }
                expect(true).toBe(false);
              });
            });
          });
        });
      });
    });
  });
});
