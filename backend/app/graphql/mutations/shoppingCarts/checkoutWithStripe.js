const { fromGlobalId, toGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const pug = require('pug');
const path = require('path');
const config = require('config');

const mailFrom = config.get('mail.from');
const mailViewPath = config.get('mail.viewPath');

const errors = {
  TAX_NOT_FOUND: 'TAX_NOT_FOUND',
  EMPTY_CART: 'EMPTY_CART',
  EMPTY_CUSTOMER: 'EMPTY_CUSTOMER',
  CUSTOMER_NEED_A_COMPLETE_ADDRESS: 'CUSTOMER_NEED_A_COMPLETE_ADDRESS',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
};

const typeDefinition = `
  input ShoppingCartCheckoutWithStripeInput {
    cartCode: String!
    taxId: ID!
    token: String!
    comments: String
  }

  type ShoppingCartCheckoutWithStripePayload {
    orderId: ID!
    clientMutationId: String
  }
`;


function sendMail(logger, mailer, message) {
  return new Promise((fulfill) => {
    mailer.sendMail(message, (err, info) => {
      if (err) {
        logger.error(err);
      }
      logger.info(info);
      fulfill();
    });
  });
}

const validate = async (input, context) => {
  const {
    sequelize,
    currentAuth,
    stripeClient,
  } = context;
  const {
    cartCode,
    taxId,
    token,
  } = input;

  const ShoppingCartRow = sequelize.model('ShoppingCartRow');
  const Tax = sequelize.model('Tax');
  const Customer = sequelize.model('Customer');

  const realTaxId = parseInt(fromGlobalId(taxId).id, 10);
  const tax = await Tax.findByPk(realTaxId);

  if (!tax) {
    throw new UserInputError(errors.TAX_NOT_FOUND);
  }

  const shoppingCartRows = await ShoppingCartRow.findAll({
    where: {
      buyNow: 1,
      cartId: cartCode,
    },
  });

  if (shoppingCartRows.length === 0) {
    throw new UserInputError(errors.EMPTY_CART);
  }

  const customer = await Customer.findOne({ where: { email: currentAuth.email } });

  if (!customer) {
    throw new UserInputError(errors.EMPTY_CUSTOMER);
  }

  if (!customer.hasCompleteAddress()) {
    throw new UserInputError(errors.CUSTOMER_NEED_A_COMPLETE_ADDRESS);
  }

  const rowSubTotals = await Promise.all(shoppingCartRows.map(async (scr) => {
    const product = await scr.getProduct();
    return (product.discountedPrice > 0 ? product.discountedPrice : product.price)
      * scr.quantity;
  }));
  const totalAmount = rowSubTotals.reduce((acc, item) => acc + item, 0);

  try {
    await stripeClient.charges.create({
      amount: totalAmount * 100,
      currency: 'usd',
      source: token,
    });
  }
  catch (e) {
    throw new UserInputError(errors.PAYMENT_ERROR, { originalError: e });
  }
};

const mutate = async (source, { input }, context) => {
  const {
    sequelize,
    guard,
    currentAuth,
    errorCodes,
    mailer,
    logger,
  } = context;
  const {
    cartCode,
    taxId,
    comments,
    clientMutationId,
  } = input;

  if (await guard.allows('order.create')) {
    await validate(input, context);
    const ShoppingCartRow = sequelize.model('ShoppingCartRow');
    const Customer = sequelize.model('Customer');
    const Order = sequelize.model('Order');
    const OrderDetail = sequelize.model('OrderDetail');

    const customer = await Customer.findOne({ where: { email: currentAuth.email } });

    const realTaxId = parseInt(fromGlobalId(taxId).id, 10);
    const shoppingCartRows = await ShoppingCartRow.findAll({
      where: {
        buyNow: 1,
        cartId: cartCode,
      },
    });

    const rowSubTotals = await Promise.all(shoppingCartRows.map(async (scr) => {
      const product = await scr.getProduct();
      return (product.discountedPrice > 0 ? product.discountedPrice : product.price)
        * scr.quantity;
    }));
    const totalAmount = rowSubTotals.reduce((acc, item) => acc + item, 0);

    const order = await Order.create({
      comments,
      createdOn: new Date(),
      customerId: customer.id,
      taxId: realTaxId,
      totalAmount,
    });

    await Promise.all(shoppingCartRows.map(async (scr) => {
      const product = await scr.getProduct();
      return OrderDetail.create({
        attributes: scr.attributes,
        quantity: scr.quantity,
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        unitCost: product.discountedPrice > 0 ? product.discountedPrice : product.price,
      });
    }));

    await ShoppingCartRow.destroy({
      where: {
        buyNow: 1,
        cartId: cartCode,
      },
    });

    const templateFunction = pug.compileFile(path.join(mailViewPath, 'orderConfirmation.pug'));

    const message = {
      from: mailFrom,
      to: currentAuth.email,
      subject: 'Order confirmation',
      html: templateFunction({
        customer,
        order,
      }),
    };

    await sendMail(logger, mailer, message);

    return {
      orderId: toGlobalId('Order', order.id),
      clientMutationId,
    };
  }
  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate };
