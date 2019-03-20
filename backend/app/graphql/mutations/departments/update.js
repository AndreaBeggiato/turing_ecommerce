const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const errors = {
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
};

const typeDefinition = `
  input DepartmentUpdateInput {
    id: ID!
    name: String!
    description: String
    clientMutationId: String
  }

  type DepartmentUpdatePayload {
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
    id,
    name,
    description,
    clientMutationId,
  } = input;

  const realDepartmentId = parseInt(fromGlobalId(id).id, 10);
  const Department = sequelize.model('Department');
  const department = await Department.findByPk(realDepartmentId);
  if (department) {
    if (await guard.allows('department.update', department)) {
      department.name = name;
      department.description = description;

      await department.save();

      return {
        department,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new UserInputError(errors.DEPARTMENT_NOT_FOUND);
};

module.exports = { typeDefinition, mutate };
