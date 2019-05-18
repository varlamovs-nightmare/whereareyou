import React, { Component } from 'react';

import { AppLayout } from './AppLayout';
import logo from './img/sticker.webp';
import { createMap } from './createMap';
import { GameController } from './GameController';

export class Game extends Component {
  constructor(props) {
    super(props);
    this.gameController = new GameController();
    this.state = { tips: this.gameController.tips() };
  }

  componentDidMount() {
    createMap('map');
    this.gameController.createGame().then(() => this.gameController.loadTips()).then(() => {
      this.setState({
        tips: this.gameController.tips()
      })
    });
  }

  render() {
    return (
      <AppLayout>
        <div>
          <h1 className="Game-header">Where are you <img src={logo} alt="logo" width={190}/></h1>
          <div className="Game-frame">
            <div className="Game-tips">
              <h2 className="Game-tips-header">What you see:</h2>
              {this.state.tips.length > 0 && (
                <ul className="Game-tips-list">
                  {this.state.tips.map(tip => <li>{tip}</li>)}
                </ul>
              )}
              <button className="Get-tips">
                Хочу узнать ещё
              </button>
            </div>
            <div className="Game-map">
              <div id="map"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }
}