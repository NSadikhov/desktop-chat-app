import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './app';
import { hot } from 'react-hot-loader';


ReactDOM.render(<App />, document.getElementById("root"));

export default hot(module)(App);
