module.exports = {
  name: 'order',
  methods: {
    create: auth => (auth && !auth.isAnonymous()),
  },
};
