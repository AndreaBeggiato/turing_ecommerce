import React from 'react';
import firebase from 'firebase';

const LoginAnonymous = () => {
  const handleSignInAnonymous = () => {
    firebase.auth().signInAnonymously();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={handleSignInAnonymous}>SignInAnonymously</button>
    </div>
  );
};

export default LoginAnonymous;
