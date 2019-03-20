const shoppingCartAddProduct = require('./mutations/shoppingCarts/addProduct');
const shoppingCartCheckoutWithStripe = require('./mutations/shoppingCarts/checkoutWithStripe');

const customerMyUpdate = require('./mutations/customers/myUpdate');

const typeDefinition = `
  type Mutation {
    shoppingCartAddProduct(input: ShoppingCartAddProductInput!): ShoppingCartAddProductPayload!
    shoppingCartCheckoutWithStripe(input: ShoppingCartCheckoutWithStripeInput!): ShoppingCartCheckoutWithStripePayload!

    customerMyUpdate(input: CustomerMyUpdateInput!): CustomerMyUpdatePayload!
}
`;

const resolver = {
  Mutation: {
    shoppingCartAddProduct: shoppingCartAddProduct.mutate,
    shoppingCartCheckoutWithStripe: shoppingCartCheckoutWithStripe.mutate,

    customerMyUpdate: customerMyUpdate.mutate,
  },
};


module.exports = { typeDefinition, resolver };
