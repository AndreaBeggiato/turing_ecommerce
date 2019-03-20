const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  input DepartmentCreateInput {
    name: String!
    description: String
    clientMutationId: String
  }

  type DepartmentCreatePayload {
    department: Department!
    clientMutationId: String
  }
`;

const mutate = async (source, { input }, context) => {
  const {
    sequelize,
    guard,
    errorCodes,
  } = context;
  const {
    name,
    description,
    clientMutationId,
  } = input;

  if (await guard.allows('department.create')) {
    const Department = sequelize.model('Department');
    const department = await Department.create({
      name,
      description,
    });

    return {
      department,
      clientMutationId,
    };
  }

  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate };
