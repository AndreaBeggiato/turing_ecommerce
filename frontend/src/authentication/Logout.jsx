import React from 'react';
import firebase from 'firebase';

const LoginAnonymous = ({ onLogout }) => {
  const handleLogout = async () => {
    await firebase.auth().signOut();
    onLogout();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LoginAnonymous;
