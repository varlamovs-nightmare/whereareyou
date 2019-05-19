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
        <p>
          Выберите город
        </p>
        <Link href="/game/Екатеринбург">
          Екатеринбург
        </Link>
        <Link href="/game/Санкт-Петербург">
          Санкт-Петербург
        </Link>
        <Link href="/game/Новосибирск">
          Новосибирск
        </Link>
        <Link href="/game/Пермь">
          Пермь
        </Link>
        <Link href="/game/Ижевск">
          Ижевск
        </Link>
        <Link href="/game/Казань">
          Казань
        </Link>
        <Link href="/game/Самара">
          Самара
        </Link>
        <Link href="/game/Лондон">
          Лондон
        </Link>
      </header>
    </AppLayout>
  )
}
