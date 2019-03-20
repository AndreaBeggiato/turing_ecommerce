const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const errors = {
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  DEPARTMENT_HAS_CATEGORIES: 'DEPARTMENT_HAS_CATEGORIES',
};

const typeDefinition = `
  input DepartmentDestroyInput {
    id: ID!
    clientMutationId: String
  }

  type DepartmentDestroyPayload {
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

  const realDepartmentId = parseInt(fromGlobalId(id).id, 10);
  const Category = sequelize.model('Category');
  const count = await Category.count({ departmentId: realDepartmentId });

  if (count > 0) {
    throw new UserInputError(errors.DEPARTMENT_HAS_CATEGORIES);
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

  const realDepartmentId = parseInt(fromGlobalId(id).id, 10);
  const Department = sequelize.model('Department');
  const department = await Department.findByPk(realDepartmentId);
  if (department) {
    if (await guard.allows('department.destroy', department)) {
      await validate(input, context);

      await department.destroy();

      return {
        success: true,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new UserInputError(errors.DEPARTMENT_NOT_FOUND);
};

module.exports = { typeDefinition, mutate };
