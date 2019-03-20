module.exports = {
  name: 'customer',
  methods: {
    list: auth => (auth && auth.isAdmin()),
    show: (auth, customer) => {
      if (!auth || auth.isAnonymous()) {
        return false;
      }
      if (auth.isAdmin()) {
        return true;
      }
      return customer.email === auth.email;
    },
    update: (auth, customer) => {
      if (!auth || auth.isAnonymous()) {
        return false;
      }
      if (auth.isAdmin()) {
        return true;
      }
      return customer.email === auth.email;
    },
  },
};
