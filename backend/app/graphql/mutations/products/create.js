const Sequelize = require('sequelize');
const { fromGlobalId } = require('graphql-relay');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { Op } = Sequelize;

const mutationDescription = `
"""
  Create a new product

  **Authentication:** ADMIN required

  **Possible errors:**
    - Authentication
      - MISSING_AUTHORIZATION: User is not logged in or not an ADMIN
    - User input
      - CATEGORY_NOT_FOUND: Cannot find at least one category in the provided _categoryIds_
      - ATTRIBUTE_VALUE_NOT_FOUND: Cannot find at least one attribute value in the provided _attributeValueIds_
"""
`;

const errors = {
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  ATTRIBUTE_VALUE_NOT_FOUND: 'ATTRIBUTE_VALUE_NOT_FOUND',
};

const typeDefinition = `
  input ProductCreateInput {
    name: String!
    description: String
    discountedPrice: Float
    price: Float!
    display: Int!
    primaryImage: FileInput
    secondaryImage: FileInput
    thumbnail: FileInput
    categoryIds: [ID!]!
    attributeValueIds: [ID!]!
    clientMutationId: String
  }

  type ProductCreatePayload {
    product: Product!
    clientMutationId: String
  }
`;

const validate = async (input, context) => {
  const {
    sequelize,
  } = context;

  const {
    categoryIds,
    attributeValueIds,
  } = input;

  const realCategoryIds = categoryIds
    .map(cId => parseInt(fromGlobalId(cId).id, 10));
  const realAttributeValueIds = attributeValueIds
    .map(avId => parseInt(fromGlobalId(avId).id, 10));
  const AttributeValue = sequelize.model('AttributeValue');
  const Category = sequelize.model('Category');

  const categoryCount = await Category
    .count({ where: { id: { [Op.in]: realCategoryIds } } });

  if (categoryCount !== categoryIds.length) {
    throw new UserInputError(errors.CATEGORY_NOT_FOUND);
  }

  const attributeValueCount = await AttributeValue
    .count({ where: { id: { [Op.in]: realAttributeValueIds } } });

  if (attributeValueCount !== attributeValueIds.length) {
    throw new UserInputError(errors.ATTRIBUTE_VALUE_NOT_FOUND);
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
    discountedPrice,
    price,
    display,
    primaryImage,
    secondaryImage,
    thumbnail,
    categoryIds,
    attributeValueIds,
    clientMutationId,
  } = input;

  if (await guard.allows('product.create')) {
    await validate(input, context);

    const realCategoryIds = categoryIds
      .map(cId => parseInt(fromGlobalId(cId).id, 10));
    const realAttributeValueIds = attributeValueIds
      .map(avId => parseInt(fromGlobalId(avId).id, 10));
    const Product = sequelize.model('Product');
    const AttributeValue = sequelize.model('AttributeValue');
    const Category = sequelize.model('Category');

    const categories = await Category
      .findAll({ where: { id: { [Op.in]: realCategoryIds } } });

    const attributeValues = await AttributeValue
      .findAll({ where: { id: { [Op.in]: realAttributeValueIds } } });

    // TODO: save image to CDN

    const product = await Product.create({
      name,
      description,
      discountedPrice: discountedPrice != null ? discountedPrice : 0,
      price,
      display,
      primaryImage: primaryImage ? primaryImage.fileName : null,
      secondaryImage: secondaryImage ? secondaryImage.fileName : null,
      thumbnail: thumbnail ? thumbnail.fileName : null,
    });


    await product.setCategories(categories);
    await product.setAttributeValues(attributeValues);

    return {
      product,
      clientMutationId,
    };
  }

  throw new AuthenticationError(errorCodes.authentication.MISSING_AUTHORIZATION);
};

module.exports = { typeDefinition, mutate, mutationDescription };
