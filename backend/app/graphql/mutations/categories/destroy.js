const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const mutationDescription = `
"""
  Destroy an existing category

  **Authentication:** ADMIN required

  **Possible errors:**
    - Authentication
      - MISSING_AUTHORIZATION: User is not logged in or not an ADMIN
    - User input
      - CATEGORY_NOT_FOUND: Cannot find the category with the provided _id_
      - CATEGORY_HAS_PRODUCTS: This category is related with some products. Delete the products first.
"""
`;

const errors = {
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  CATEGORY_HAS_PRODUCTS: 'CATEGORY_HAS_PRODUCTS',
};

const typeDefinition = `
  input CategoryDestroyInput {
    id: ID!
    clientMutationId: String
  }

  type CategoryDestroyPayload {
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

  const realCategoryId = parseInt(fromGlobalId(id).id, 10);
  const ProductCategory = sequelize.model('ProductCategory');
  const count = await ProductCategory.count({ where: { categoryId: realCategoryId } });

  if (count > 0) {
    throw new UserInputError(errors.CATEGORY_HAS_PRODUCTS);
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

  const realCategoryId = parseInt(fromGlobalId(id).id, 10);
  const Category = sequelize.model('Category');
  const category = await Category.findByPk(realCategoryId);
  if (category) {
    if (await guard.allows('category.destroy', category)) {
      await validate(input, context);

      await category.destroy();

      return {
        success: true,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new UserInputError(errors.CATEGORY_NOT_FOUND);
};

module.exports = { typeDefinition, mutate, mutationDescription };
