import React from 'react';

import './index.css';
import * as serviceWorker from './serviceWorker';
import { router } from './router';
import { render } from './render';

router.resolve(window.location.pathname).then(render);

window.onpopstate = function() {
  router.resolve(window.location.pathname).then(render);
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
