const typeDefinition = `
  interface Node {
    id: ID!
  }
`;

const resolver = {
  Node: {
    __resolveType(obj) {
      if (obj.constructor && obj.constructor.modelName) {
        const { modelName } = obj.constructor;
        if (modelName === 'Hotel') {
          return 'Hotel';
        }
        if (modelName === 'Season') {
          return 'Season';
        }
        if (modelName === 'RoomType') {
          return 'RoomType';
        }
        if (modelName === 'Board') {
          return 'Board';
        }
        if (modelName === 'PeoplePolicy') {
          return 'PeoplePolicy';
        }
        if (modelName === 'EarlyBookingRolling') {
          return 'EarlyBookingRolling';
        }
        if (modelName === 'StayPromotion') {
          return 'StayPromotion';
        }
        if (modelName === 'SeasonalRate') {
          return 'SeasonalRate';
        }
        if (modelName === 'Market') {
          return 'Market';
        }
        if (modelName === 'Source') {
          return 'Source';
        }
        if (modelName === 'Reservation') {
          return 'Reservation';
        }
        if (modelName === 'GlobalReservation') {
          return 'GlobalReservation';
        }
        if (modelName === 'RateTag') {
          return 'RateTag';
        }
        return null;
      }
      return 'Company';
    },
  },
};

module.exports = { typeDefinition, resolver };
