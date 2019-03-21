import React, { useState } from 'react';
import firebase from 'firebase';

const LoginFacebook = () => {
  const [error, setError] = useState(null);
  const handleSignInFacebook = async () => {
    try {
      await firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider());
      setError(null);
    }
    catch (e) {
      setError(e);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <ul>
        <li>pcibgtbyjn_1553103924@tfbnw.net - Str0ngPassword</li>
        <li>mowhtkertk_1553103930@tfbnw.net - Str0ngPassword</li>
        <li>vbuyiubcjp_1553103937@tfbnw.net - Str0ngPassword</li>
      </ul>
      <button onClick={handleSignInFacebook}>SignInFacebook</button>
      {error && <code>{JSON.stringify(error)}</code>}
    </div>
  );
};

export default LoginFacebook;
