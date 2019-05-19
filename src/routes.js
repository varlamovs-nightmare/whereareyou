import React from 'react';

import { Welcome } from './Welcome';
import { Game } from './Game';
import { NotFound } from './404';

export const routes = [
  {
    path: '',
    action: Welcome
  },
  {
    path: '/game',
    action: (context) => <Game city={context.query.get('city') || 'Екатеринбург'}/>
  },
  {
    path: '(.*)',
    action: NotFound
  }
];