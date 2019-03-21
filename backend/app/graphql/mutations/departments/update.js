const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const mutationDescription = `
"""
  Update an existing department

  **Authentication:** ADMIN required

  **Possible errors:**
    - Authentication
      - MISSING_AUTHORIZATION: User is not logged in or not an ADMIN
    - User input
      - DEPARTMENT_NOT_FOUND: Cannot find the department with the provided id
"""
`;

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

      try {
        await department.save();
      }
      catch (err) {
        if (err.message !== 'Query was empty') { // Sequelize launch and complain about empty query if you change nothing. bah
          throw err;
        }
      }

      return {
        department,
        clientMutationId,
      };
    }

    throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
  }

  throw new UserInputError(errors.DEPARTMENT_NOT_FOUND);
};

module.exports = { typeDefinition, mutate, mutationDescription };
