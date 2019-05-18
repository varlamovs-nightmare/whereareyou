import React, { Component } from 'react';

import { AppLayout } from './AppLayout';
import logo from './img/cat.png';
import { createMap } from './createMap';
import { GameController } from './GameController';
import { Notification } from './Notification';
import Button from '@skbkontur/react-ui/Button';

export class Game extends Component {
  constructor(props) {
    super(props);
    this.notification = new Notification();
    this.gameController = new GameController(this.notification);
    this.state = {
      tips: this.gameController.tips(),
      loading: true
    };
  }

  componentDidMount() {
    this.gameController.createGame().then(() => this.gameController.loadTips()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        loading: false
      }, () => {
        createMap('map');
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  }

  askTip = () => {
    this.gameController.getMoreTips().then(() => {
      this.setState({
        tips: this.gameController.tips()
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  move = () => {
    this.gameController.goForward().then(() => {
      this.setState({
        tips: this.gameController.tips()
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  render() {
    if(this.state.loading) {
      return (
        <AppLayout>
          <h1 className="jump-text">Парсим википедию</h1>
        </AppLayout>
      );
    }

    return (
      <AppLayout>
        <div>
          <h1 className="Game-header">Where are you <img src={logo} alt="logo" width={190}/></h1>
          <div className="Game-frame">
            <div className="Game-tips">
              <h2 className="Game-tips-header">What you see:</h2>
              {this.state.tips.length > 0 && (
                <ul className="Game-tips-list">
                  {this.state.tips.map(tip => <li key={tip}>{tip}</li>)}
                </ul>
              )}

              <div className="Game-controls">
                <div className="Get-button">
                  <Button onClick={this.askTip} size="medium">
                    Осмотреться
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.move} size="medium">
                    Пройти дальше
                  </Button>
                </div>
              </div>
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
