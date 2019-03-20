module.exports = {
  name: 'department',
  methods: {
    list: () => true,
    show: () => true,
    create: auth => auth && auth.isAdmin(),
    update: auth => auth && auth.isAdmin(),
    destroy: auth => auth && auth.isAdmin(),
  },
};
