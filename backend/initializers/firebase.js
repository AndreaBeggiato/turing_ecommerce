const firebaseAdmin = require('firebase-admin');
const config = require('config');

const firebaseConfig = config.get('firebase');
const init = async () => {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({ ...firebaseConfig }),
  });
};

module.exports = init();
