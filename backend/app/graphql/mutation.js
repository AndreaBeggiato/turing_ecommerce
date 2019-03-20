const departmentCreate = require('./mutations/departments/create');
const departmentUpdate = require('./mutations/departments/update');
const departmentDestroy = require('./mutations/departments/destroy');

const shoppingCartAddProduct = require('./mutations/shoppingCarts/addProduct');
const shoppingCartCheckoutWithStripe = require('./mutations/shoppingCarts/checkoutWithStripe');

const customerMyUpdate = require('./mutations/customers/myUpdate');

const typeDefinition = `
  type Mutation {
    departmentCreate(input: DepartmentCreateInput!): DepartmentCreatePayload!
    departmentUpdate(input: DepartmentUpdateInput!): DepartmentUpdatePayload!
    departmentDestroy(input: DepartmentDestroyInput!): DepartmentDestroyPayload!

    shoppingCartAddProduct(input: ShoppingCartAddProductInput!): ShoppingCartAddProductPayload!
    shoppingCartCheckoutWithStripe(input: ShoppingCartCheckoutWithStripeInput!): ShoppingCartCheckoutWithStripePayload!

    customerMyUpdate(input: CustomerMyUpdateInput!): CustomerMyUpdatePayload!
}
`;

const resolver = {
  Mutation: {
    departmentCreate: departmentCreate.mutate,
    departmentUpdate: departmentUpdate.mutate,
    departmentDestroy: departmentDestroy.mutate,

    shoppingCartAddProduct: shoppingCartAddProduct.mutate,
    shoppingCartCheckoutWithStripe: shoppingCartCheckoutWithStripe.mutate,

    customerMyUpdate: customerMyUpdate.mutate,
  },
};


module.exports = { typeDefinition, resolver };
