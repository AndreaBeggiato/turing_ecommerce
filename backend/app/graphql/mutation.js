const shoppingCartAddProduct = require('./mutations/shoppingCarts/addProduct');
const customerMyUpdate = require('./mutations/customers/myUpdate');

const typeDefinition = `
  type Mutation {
    shoppingCartAddProduct(input: ShoppingCartAddProductInput!): ShoppingCartAddProductPayload!
    customerMyUpdate(input: CustomerMyUpdate!): CustomerMyPayload!
}
`;

const resolver = {
  Mutation: {
    shoppingCartAddProduct: shoppingCartAddProduct.mutate,
    customerMyUpdate: customerMyUpdate.mutate,
  },
};


module.exports = { typeDefinition, resolver };
