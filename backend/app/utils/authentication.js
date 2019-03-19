const firebaseAdmin = require('firebase-admin');

const decodeUser = async (logger, token) => {
  if (!token) return false;
  try {
    const result = await firebaseAdmin.auth().verifyIdToken(token);
    result.isAnonymous = () => result.provider_id === 'anonymous';
    return result;
  }
  catch (e) {
    logger.error(e);
    return false;
  }
};

module.exports = {
  decodeUser,
};
