const { toGlobalId } = require('graphql-relay');
const { AuthenticationError } = require('apollo-server-express');

const typeDefinition = `
  type Category implements Node {
    id: ID!
    name: String!
    description: String!
    department: Department!
  }
`;

const resolver = {
  Category: {
    id: source => toGlobalId('Category', source.id),
    name: source => source.name,
    description: source => source.description,
    department: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        errorCodes,
      } = context;
      const Department = sequelize.model('Department');
      const department = await Department.find({ id: source.departmentId });
      dataloaders.default('Department').prime(source.departmentId, department);
      if (await guard.allows('department.show', department)) {
        return department;
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
  },
};

module.exports = { typeDefinition, resolver };
