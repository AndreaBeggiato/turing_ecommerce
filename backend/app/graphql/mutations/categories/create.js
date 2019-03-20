const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const errors = {
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
};

const typeDefinition = `
  input CategoryCreateInput {
    name: String!
    description: String
    departmentId: ID!
    clientMutationId: String
  }

  type CategoryCreatePayload {
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
    name,
    description,
    departmentId,
    clientMutationId,
  } = input;

  if (await guard.allows('category.create')) {
    await validate(input, context);

    const realDepartmentId = parseInt(fromGlobalId(departmentId).id, 10);
    const Category = sequelize.model('Category');
    const category = await Category.create({
      name,
      description,
      departmentId: realDepartmentId,
    });

    return {
      category,
      clientMutationId,
    };
  }

  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate };
