import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import config from './config';
import * as serviceWorker from './serviceWorker';

config();

ReactDOM.render(<App />, document.getElementById('root')); // eslint-disable-line

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
