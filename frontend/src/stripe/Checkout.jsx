import React, { useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

import { stripeConfig } from '../config';

const Checkout = () => {
  const [stripeToken, setStripeToken] = useState();

  const handleOnToken = (token) => {
    setStripeToken(token);
  };

  return (
    <div>
      <div>
        Cards:
        <ul>
          <li>Valid: 4242424242424242</li>
          <li>Expired: 4000000000000069</li>
          <li>Declined: 4000000000009995</li>
        </ul>
      </div>
      <StripeCheckout
        token={handleOnToken}
        stripeKey={stripeConfig.publicKey}
      />
    {stripeToken && <code>{stripeToken.id}</code>}
    </div>
  );
};

export default Checkout;
