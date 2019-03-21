const Sequelize = require('sequelize');
const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { Op } = Sequelize;

const mutationDescription = `
"""
  Add a product to the cart specified by the provided _cartCode_

  **Authentication:** NONE, ANONYMOUS, NORMAL, ADMIN

  **Possible errors:**
    - User input
      - CART_CODE_TOO_LONG: The provided _cartCode_ is too long. Maximum legnth is 32
      - QUANTITY_TOO_LOW: Quantity must be greater then 0
      - PRODUCT_NOT_FOUND: Cannot find the product with the provided _id_
      - ATTRIBUTE_VALUES_NOT_IN_PRODUCT: Cannot find at least on attribute value in the product attributes
      - MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE: Multiple attribute values for the same attribute was provided
"""
`;

const errors = {
  CART_CODE_TOO_LONG: 'CART_CODE_TOO_LONG',
  QUANTITY_TOO_LOW: 'QUANTITY_TOO_LOW',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ATTRIBUTE_VALUES_NOT_IN_PRODUCT: 'ATTRIBUTE_VALUES_NOT_IN_PRODUCT',
  MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE: 'MULTIPLE_ATTRIBUTE_VALUES_FOR_SAME_ATTRIBUTE',
};

const typeDefinition = `
  input ShoppingCartAddProductInput {
    """
      Client side generated. Can be a random string of max 32 chars.
    """
    cartCode: String!
    productId: ID!
    quantity: Int!
    attributeValueIds: [ID!]!
    clientMutationId: String
  }

  type ShoppingCartAddProductPayload {
    shoppingCart: ShoppingCart!
    clientMutationId: String
  }
`;

const validate = async (input, context) => {
  const {
    sequelize,
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

  const Product = sequelize.model('Product');

  const realProductId = parseInt(fromGlobalId(productId).id, 10);
  const product = await Product.findByPk(realProductId);

  if (!product) {
    throw new UserInputError(errors.PRODUCT_NOT_FOUND);
  }

  if (attributeValueIds.length) {
    const realAttributeValueIds = attributeValueIds.map(avi => parseInt(fromGlobalId(avi).id, 10));

    const attributeValues = await product.getAttributeValues({
      where: { id: { [Op.in]: realAttributeValueIds } },
    });

    if (attributeValues.length !== realAttributeValueIds.length) {
      throw new UserInputError(errors.ATTRIBUTE_VALUES_NOT_IN_PRODUCT);
    }

    const uniqueAttributeIds = [...new Set(attributeValues.map(av => av.attributeId))];

    if (uniqueAttributeIds.length !== realAttributeValueIds.length) {
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

    const realProductId = parseInt(fromGlobalId(productId).id, 10);
    const realAttributeValueIds = attributeValueIds.map(avi => parseInt(fromGlobalId(avi).id, 10));

    let shoppingCartRow = await ShoppingCartRow.findOne({
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
    shoppingCartRow.buyNow = 1;

    await shoppingCartRow.save();

    return {
      shoppingCart: ShoppingCartRow.findAll({ where: { cartId: cartCode } }),
      clientMutationId,
    };
  }
  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate, mutationDescription };
