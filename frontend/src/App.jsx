import React, { useState } from 'react';
import firebase from 'firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  LoginAnonymous,
  LoginUserPassword,
  LoginFacebook,
  RegisterUserPassword,
  Logout,
} from './authentication';
import { StripeCheckout } from './stripe';


const App = () => {
  const { initialising, user } = useAuthState(firebase.auth());
  const [jwt, setJwt] = useState(null);


  if (!initialising) {
    if (user && !jwt) {
      console.log(user.email);
      user.getIdToken(true).then(j => setJwt(j));
    }

    if (user) {
      return (
        <div>
          <Logout onLogout={() => setJwt(null)} />
          <h3>JWT</h3>
          <code>{jwt}</code>
          <h3>User</h3>
          <code>{JSON.stringify(user)}</code>
          <StripeCheckout />
        </div>
      );
    }
    return (
      <div>
        <div>
          <RegisterUserPassword />
          <hr />
          <LoginAnonymous />
          <hr />
          <LoginUserPassword />
          <hr />
          <LoginFacebook />
        </div>
        <StripeCheckout />
      </div>
    );
  }
  return '...';
};

export default App;
