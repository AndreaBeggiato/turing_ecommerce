module.exports = {
  name: 'product',
  methods: {
    list: () => true,
    show: (auth, product) => {
      if (!auth || auth.isAnonymous()) {
        return product.display > 0;
      }
      return true;
    },
  },
};
