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
        <Link href="/game?city=Екатеринбург">
          Екатеринбург
        </Link>
        <Link href="/game?city=Санкт-Петербург">
          Санкт-Петербург
        </Link>
        <Link href="/game?city=Новосибирск">
          Новосибирск
        </Link>
        <Link href="/game?city=Пермь">
          Пермь
        </Link>
        <Link href="/game?city=Ижевск">
          Ижевск
        </Link>
        <Link href="/game?city=Казань">
          Казань
        </Link>
        <Link href="/game?city=Самара">
          Самара
        </Link>
        <Link href="/game?city=Лондон">
          Лондон
        </Link>
      </header>
    </AppLayout>
  )
}
