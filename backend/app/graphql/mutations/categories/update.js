const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const mutationDescription = `
"""
  Update an existing category

  **Authentication:** ADMIN required

  **Possible errors:**
    - Authentication
      - MISSING_AUTHORIZATION: User is not logged in or not an ADMIN
    - User input
      - CATEGORY_NOT_FOUND: Cannot find the category with the provided _id_
      - DEPARTMENT_NOT_FOUND: Cannot find the department with the provided _departmentId_
"""
`;

const errors = {
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
};

const typeDefinition = `
  input CategoryUpdateInput {
    id: ID!
    name: String!
    description: String
    departmentId: ID!
    clientMutationId: String
  }

  type CategoryUpdatePayload {
    category: Category!
    clientMutationId: String
  }
`;

const validate = async (input, context) => {
  const {
    sequelize,
  } = context;

  const {
    departmentId,
  } = input;

  const realDepartmentId = parseInt(fromGlobalId(departmentId).id, 10);
  const Department = sequelize.model('Department');
  const department = await Department.findByPk(realDepartmentId);

  if (!department) {
    throw new UserInputError(errors.DEPARTMENT_NOT_FOUND);
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
    name,
    description,
    departmentId,
    clientMutationId,
  } = input;

  const realCategoryId = parseInt(fromGlobalId(id).id, 10);
  const Category = sequelize.model('Category');
  const category = await Category.findByPk(realCategoryId);
  if (category) {
    if (await guard.allows('category.update', category)) {
      await validate(input, context);
      const realDepartmentId = parseInt(fromGlobalId(departmentId).id, 10);
      category.name = name;
      category.description = description;
      category.departmentId = realDepartmentId;

      try {
        await category.save();
      }
      catch (err) {
        if (err.message !== 'Query was empty') { // Sequelize launch and complain about empty query if you change nothing. bah
          throw err;
        }
      }

      return {
        category,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new UserInputError(errors.CATEGORY_NOT_FOUND);
};

module.exports = { typeDefinition, mutate, mutationDescription };
