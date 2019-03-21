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
    taxes: [Tax!]!
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
        const node = await dataloaders.default('Department').load(realId);
        if (await guard.allows('department.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'Product') {
        const node = await dataloaders.default('Product').load(realId);
        if (await guard.allows('product.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'Category') {
        const node = await dataloaders.default('Category').load(realId);
        if (await guard.allows('category.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'Attribute') {
        const node = await dataloaders.default('Attribute').load(realId);
        if (await guard.allows('attribute.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'AttributeValue') {
        const node = await dataloaders.default('AttributeValue').load(realId);
        if (await guard.allows('attributeValue.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'ShippingRegion') {
        const node = await dataloaders.default('ShippingRegion').load(realId);
        if (await guard.allows('shippingRegion.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'Tax') {
        const node = await dataloaders.default('Tax').load(realId);
        if (await guard.allows('tax.show', node)) {
          return node;
        }
        throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
      }
      else if (type === 'Customer') {
        const node = await dataloaders.default('Customer').load(realId);
        if (await guard.allows('customer.show', node)) {
          return node;
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
    taxes: async (source, args, context) => {
      const {
        sequelize,
        dataloaders,
        guard,
        currentAuth,
        errorCodes,
      } = context;
      const Tax = sequelize.model('Tax');
      if (await guard.allows('tax.list')) {
        const taxes = await Tax
          .findAll(await Tax.authScope(currentAuth));
        const ids = taxes.map(r => r.id);
        ids.forEach(id => dataloaders.default('Tax').prime(id, taxes.find(r => r.id === id)));
        return dataloaders.default('Tax').loadMany(ids);
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
