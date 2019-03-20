const { createConnectionResolver } = require('graphql-sequelize');
const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { apply: applyProductFilter } = require('../filters/product');

const typeDefinition = `
  type Viewer {
    node(id: ID!): Node!
    departments: [Department!]!
    products(first: Int, last: Int, before: String, after: String, filter: ProductFilter): ProductConnection!
    shoppingCart(cartCode: String!): ShoppingCart!
    shippingRegions: [ShippingRegion!]!
    myCustomer: Customer,
  }
`;

const resolver = {
  Viewer: {
    node: async (source, args, context) => {
      const { id } = args;
      const { dataloaders, guard, errorCodes } = context;
      const { type, id: realId } = fromGlobalId(id);
      if (type === 'Department') {
        if (await guard.allows('department.show')) {
          return dataloaders.default('Department').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      if (type === 'Product') {
        if (await guard.allows('product.show')) {
          return dataloaders.default('Product').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      if (type === 'Category') {
        if (await guard.allows('category.show')) {
          return dataloaders.default('Category').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      if (type === 'Attribute') {
        if (await guard.allows('attribute.show')) {
          return dataloaders.default('Attribute').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      if (type === 'AttributeValue') {
        if (await guard.allows('attributeValue.show')) {
          return dataloaders.default('AttributeValue').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      if (type === 'ShippingRegion') {
        if (await guard.allows('shippingRegion.show')) {
          return dataloaders.default('ShippingRegion').load(realId);
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      throw new ApolloError(errorCodes.generic.INVALID_TYPE, 'GENERIC', { type });
    },
    departments: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        currentAuth,
        errorCodes,
      } = context;
      const Department = sequelize.model('Department');
      if (await guard.allows('department.list')) {
        const departments = await Department.findAll(await Department.authScope(currentAuth));
        const ids = departments.map(r => r.id);
        ids.forEach(id => dataloaders.default('Department').prime(id, departments.find(r => r.id === id)));
        return dataloaders.default('Department').loadMany(ids);
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
    products: async (source, args, context, info) => {
      const {
        sequelize,
        dataloaders,
        currentAuth,
        guard,
        errorCodes,
      } = context;
      const Product = sequelize.model('Product');
      if (await guard.allows('product.list')) {
        const whereClause = {
          ...(await Product.authScope(currentAuth)).where,
          ...(await applyProductFilter(args)).where,
        };
        const { resolveConnection } = createConnectionResolver({
          target: Product,
          before: async findOperation => ({
            ...findOperation,
            where: whereClause,
          }),
          after: (result) => {
            const ids = result.edges.map(r => r.id);
            ids.forEach(id => dataloaders.default('Product').prime(id, result.edges.find(r => r.id === id)));
            return result;
          },
        });
        return resolveConnection(source, args, context, info);
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
    shoppingCart: (source, args) => args.cartCode,
    shippingRegions: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        currentAuth,
        errorCodes,
      } = context;
      const ShippingRegion = sequelize.model('ShippingRegion');
      if (await guard.allows('shippingRegion.list')) {
        const shippingRegions = await ShippingRegion
          .findAll(await ShippingRegion.authScope(currentAuth));
        const ids = shippingRegions.map(r => r.id);
        ids.forEach(id => dataloaders.default('ShippingRegion').prime(id, shippingRegions.find(r => r.id === id)));
        return dataloaders.default('ShippingRegion').loadMany(ids);
      }
      throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
    },
    myCustomer: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        currentAuth,
        errorCodes,
      } = context;
      if (currentAuth) {
        const Customer = sequelize.model('Customer');
        const customer = await Customer.findOne({ where: { email: currentAuth.email } });
        if (customer) {
          dataloaders.default('Customer').prime(customer.id, customer);
          if (await guard.allows('customer.show', customer)) {
            return customer;
          }
          throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
        }
        return null;
      }
      return null;
    },
  },
};

module.exports = { typeDefinition, resolver };
