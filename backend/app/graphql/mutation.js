const shoppingCartAddProduct = require('./mutations/shoppingCarts/addProduct');
const customerMyUpdate = require('./mutations/customers/myUpdate');

const typeDefinition = `
  type Mutation {
    shoppingCartAddProduct(input: ShoppingCartAddProductInput!): ShoppingCartAddProductPayload!
    customerMyUpdate(input: CustomerMyUpdateInput!): CustomerMyUpdatePayload!
}
`;

const resolver = {
  Mutation: {
    shoppingCartAddProduct: shoppingCartAddProduct.mutate,
    customerMyUpdate: customerMyUpdate.mutate,
  },
};


module.exports = { typeDefinition, resolver };
