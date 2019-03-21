const departmentCreate = require('./mutations/departments/create');
const departmentUpdate = require('./mutations/departments/update');
const departmentDestroy = require('./mutations/departments/destroy');

const categoryCreate = require('./mutations/categories/create');
const categoryUpdate = require('./mutations/categories/update');
const categoryDestroy = require('./mutations/categories/destroy');

const productCreate = require('./mutations/products/create');
const productUpdate = require('./mutations/products/update');
const productDestroy = require('./mutations/products/destroy');

const shoppingCartAddProduct = require('./mutations/shoppingCarts/addProduct');
const shoppingCartCheckoutWithStripe = require('./mutations/shoppingCarts/checkoutWithStripe');

const customerMyUpdate = require('./mutations/customers/myUpdate');

const typeDefinition = `
  type Mutation {
    ${departmentCreate.mutationDescription}
    departmentCreate(input: DepartmentCreateInput!): DepartmentCreatePayload!
    ${departmentUpdate.mutationDescription}
    departmentUpdate(input: DepartmentUpdateInput!): DepartmentUpdatePayload!
    ${departmentDestroy.mutationDescription}
    departmentDestroy(input: DepartmentDestroyInput!): DepartmentDestroyPayload!

    ${categoryCreate.mutationDescription}
    categoryCreate(input: CategoryCreateInput!): CategoryCreatePayload!
    ${categoryUpdate.mutationDescription}
    categoryUpdate(input: CategoryUpdateInput!): CategoryUpdatePayload!
    ${categoryDestroy.mutationDescription}
    categoryDestroy(input: CategoryDestroyInput!): CategoryDestroyPayload!

    ${productCreate.mutationDescription}
    productCreate(input: ProductCreateInput!): ProductCreatePayload!
    ${productUpdate.mutationDescription}
    productUpdate(input: ProductUpdateInput!): ProductUpdatePayload!
    ${productDestroy.mutationDescription}
    productDestroy(input: ProductDestroyInput!): ProductDestroyPayload!

    ${shoppingCartAddProduct.mutationDescription}
    shoppingCartAddProduct(input: ShoppingCartAddProductInput!): ShoppingCartAddProductPayload!
    ${shoppingCartCheckoutWithStripe.mutationDescription}
    shoppingCartCheckoutWithStripe(input: ShoppingCartCheckoutWithStripeInput!): ShoppingCartCheckoutWithStripePayload!

    ${customerMyUpdate.mutationDescription}
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

    productCreate: productCreate.mutate,
    productUpdate: productUpdate.mutate,
    productDestroy: productDestroy.mutate,

    shoppingCartAddProduct: shoppingCartAddProduct.mutate,
    shoppingCartCheckoutWithStripe: shoppingCartCheckoutWithStripe.mutate,

    customerMyUpdate: customerMyUpdate.mutate,
  },
};


module.exports = { typeDefinition, resolver };
