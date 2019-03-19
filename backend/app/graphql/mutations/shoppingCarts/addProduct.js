const Sequelize = require('sequelize');
const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { Op } = Sequelize;

const errors = {
  CART_CODE_TOO_LONG: 'CART_CODE_TOO_LONG',
  QUANTITY_TOO_LOW: 'QUANTITY_TOO_LOW',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ATTRIBUTE_VALUES_NOT_IN_PRODUCT: 'ATTRIBUTE_VALUES_NOT_IN_PRODUCT',
  MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE: 'MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE',
};

const typeDefinition = `
  input ShoppingCartAddProductInput {
    cartCode: String!
    productId: ID!
    quantity: Int!
    attributeValueIds: [ID!]!
    clientMutationId: String
  }

  type ShoppingCartPayload {
    shoppingCart: ShoppingCart!
    clientMutationId: String
  }
`;

const validate = async (input, context) => {
  const {
    dataloaders,
  } = context;
  const {
    cartCode,
    productId,
    quantity,
    attributeValueIds,
  } = input;

  if (cartCode.length > 32) {
    throw new UserInputError(errors.CART_CODE_TOO_LONG);
  }

  if (quantity <= 0) {
    throw new UserInputError(errors.QUANTITY_TOO_LOW);
  }

  const { id: realProductId } = fromGlobalId(productId);
  const product = dataloaders.default('Product').load(realProductId);

  if (!product) {
    throw new UserInputError(errors.PRODUCT_NOT_FOUND);
  }

  if (attributeValueIds.length) {
    const realAttributeValueIds = attributeValueIds.map(avi => fromGlobalId(avi).id);

    const attributeValues = await product.getAttributeValues({
      where: { id: { [Op.in]: realAttributeValueIds } },
    });

    if (attributeValues.length !== realAttributeValueIds) {
      throw new UserInputError(errors.ATTRIBUTE_VALUES_NOT_IN_PRODUCT);
    }

    const uniqueAttributeIds = new Set(...attributeValues.map(av => av.attributeId));

    if (uniqueAttributeIds.length !== uniqueAttributeIds) {
      throw new UserInputError(errors.MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE);
    }
  }
};

const mutate = async (source, { input }, context) => {
  const {
    sequelize,
    guard,
    errorCodes,
  } = context;
  const {
    cartCode,
    productId,
    quantity,
    attributeValueIds,
    clientMutationId,
  } = input;

  if (await guard.allows('shoppingCartRow.create')) {
    await validate(input, context);

    const ShoppingCartRow = sequelize.model('ShoppingCartRow');

    const { id: realProductId } = fromGlobalId(productId);
    const realAttributeValueIds = attributeValueIds.map(avi => fromGlobalId(avi).id);

    let shoppingCartRow = ShoppingCartRow.findOne({
      where: {
        cartId: cartCode,
        productId: realProductId,
        attributes: realAttributeValueIds.sort().join(','),
      },
    });

    if (shoppingCartRow) {
      shoppingCartRow.quantity += quantity;
    }
    else {
      shoppingCartRow = ShoppingCartRow.build({
        cartId: cartCode,
        productId: realProductId,
        attributes: realAttributeValueIds.sort().join(','),
        quantity,
      });
    }

    shoppingCartRow.addedOn = new Date();

    await shoppingCartRow.save();

    return {
      shoppingCart: ShoppingCartRow.findAll({ where: { cartId: cartCode } }),
      clientMutationId,
    };
  }
  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate };
