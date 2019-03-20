const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const errors = {
  SHIPPING_REGION_NOT_FOUND: 'SHIPPING_REGION_NOT_FOUND',
};

const typeDefinition = `
  input CustomerMyUpdateInput {
    address1: String
    address2: String
    city: String
    country: String
    creditCard: String
    dayPhone: String
    eveningPhone: String
    mobilePhone: String
    name: String!
    postalCode: String
    region: String
    shippingRegionId: ID!
    clientMutationId: String
  }

  type CustomerMyUpdatePayload {
    customer: Customer!
    clientMutationId: String
  }
`;

const validate = async (input, context) => {
  const {
    sequelize,
  } = context;
  const {
    shippingRegionId,
  } = input;

  const ShippingRegion = sequelize.model('ShippingRegion');
  const realShippingRegionId = parseInt(fromGlobalId(shippingRegionId).id, 10);

  const shippingRegion = await ShippingRegion.findByPk(realShippingRegionId);

  if (!shippingRegion) {
    throw new UserInputError(errors.SHIPPING_REGION_NOT_FOUND);
  }
};

const mutate = async (source, { input }, context) => {
  const {
    sequelize,
    guard,
    currentAuth,
    errorCodes,
  } = context;
  const {
    address1,
    address2,
    city,
    country,
    creditCard,
    dayPhone,
    eveningPhone,
    mobilePhone,
    name,
    postalCode,
    region,
    shippingRegionId,
    clientMutationId,
  } = input;


  if (currentAuth && !currentAuth.isAnonymous()) {
    const Customer = sequelize.model('Customer');
    let customer = await Customer.findOne({ where: { email: currentAuth.email } });
    if (!customer) {
      customer = Customer.build({ email: currentAuth.email, password: 'unused' });
    }

    if (await guard.allows('customer.update', customer)) {
      await validate(input, context);

      const realShippingRegionId = parseInt(fromGlobalId(shippingRegionId).id, 10);

      customer.address1 = address1;
      customer.address2 = address2;
      customer.city = city;
      customer.country = country;
      customer.creditCard = creditCard;
      customer.dayPhone = dayPhone;
      customer.eveningPhone = eveningPhone;
      customer.mobilePhone = mobilePhone;
      customer.name = name;
      customer.postalCode = postalCode;
      customer.region = region;
      customer.shippingRegionId = realShippingRegionId;

      await customer.save();

      return {
        customer,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate };
