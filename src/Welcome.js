import logo from './img/cat.png';
import React from 'react';
import { AppLayout } from './AppLayout';
import { Link } from './Link';

export function Welcome() {
  return (
    <AppLayout>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Where are you
        </p>
        <Link href="/game">
          Начать
        </Link>
      </header>
    </AppLayout>
  )
}
