const departmentCreate = require('./mutations/departments/create');
const departmentUpdate = require('./mutations/departments/update');
const departmentDestroy = require('./mutations/departments/destroy');

const categoryCreate = require('./mutations/categories/create');
const categoryUpdate = require('./mutations/categories/update');
const categoryDestroy = require('./mutations/categories/destroy');

const shoppingCartAddProduct = require('./mutations/shoppingCarts/addProduct');
const shoppingCartCheckoutWithStripe = require('./mutations/shoppingCarts/checkoutWithStripe');

const customerMyUpdate = require('./mutations/customers/myUpdate');

const typeDefinition = `
  type Mutation {
    departmentCreate(input: DepartmentCreateInput!): DepartmentCreatePayload!
    departmentUpdate(input: DepartmentUpdateInput!): DepartmentUpdatePayload!
    departmentDestroy(input: DepartmentDestroyInput!): DepartmentDestroyPayload!


    categoryCreate(input: CategoryCreateInput!): CategoryCreatePayload!
    categoryUpdate(input: CategoryUpdateInput!): CategoryUpdatePayload!
    categoryDestroy(input: CategoryDestroyInput!): CategoryDestroyPayload!

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

    categoryCreate: categoryCreate.mutate,
    categoryUpdate: categoryUpdate.mutate,
    categoryDestroy: categoryDestroy.mutate,

    shoppingCartAddProduct: shoppingCartAddProduct.mutate,
    shoppingCartCheckoutWithStripe: shoppingCartCheckoutWithStripe.mutate,

    customerMyUpdate: customerMyUpdate.mutate,
  },
};


module.exports = { typeDefinition, resolver };
