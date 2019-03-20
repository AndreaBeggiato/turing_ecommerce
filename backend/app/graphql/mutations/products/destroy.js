const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const errors = {
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_HAS_CARTS: 'PRODUCT_HAS_CARTS',
  PRODUCT_HAS_ORDERS: 'PRODUCT_HAS_ORDERS',
};

const typeDefinition = `
  input ProductDestroyInput {
    id: ID!
    clientMutationId: String
  }

  type ProductDestroyPayload {
    success: Boolean!
    clientMutationId: String
  }
`;

const validate = async (input, context) => {
  const {
    sequelize,
  } = context;

  const {
    id,
  } = input;

  const realProductId = parseInt(fromGlobalId(id).id, 10);
  const OrderDetail = sequelize.model('OrderDetail');
  const ShoppingCartRow = sequelize.model('ShoppingCartRow');

  const orderDetailCount = await OrderDetail.count({ where: { productId: realProductId } });

  if (orderDetailCount > 0) {
    throw new UserInputError(errors.PRODUCT_HAS_ORDERS);
  }

  const shoppingCartRowCount = await ShoppingCartRow.count({ where: { productId: realProductId } });

  if (shoppingCartRowCount > 0) {
    throw new UserInputError(errors.PRODUCT_HAS_CARTS);
  }
};

const mutate = async (source, { input }, context) => {
  const {
    sequelize,
    guard,
    errorCodes,
  } = context;
  const {
    id,
    clientMutationId,
  } = input;

  const realProductId = parseInt(fromGlobalId(id).id, 10);
  const Product = sequelize.model('Product');
  const product = await Product.findByPk(realProductId);
  if (product) {
    if (await guard.allows('product.destroy', product)) {
      await validate(input, context);

      await product.destroy();

      return {
        success: true,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new UserInputError(errors.PRODUCT_NOT_FOUND);
};

module.exports = { typeDefinition, mutate };
