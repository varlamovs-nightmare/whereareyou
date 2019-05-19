import React, { Component } from 'react';

import { AppLayout } from './AppLayout';
import logo from './img/cat.png';
import varlamov from './img/varlamov.png';
import { createMap } from './createMap';
import { GameController } from './GameController';
import { Notification } from './Notification';
import Button from '@skbkontur/react-ui/Button';

export class Game extends Component {
  constructor(props) {
    super(props);
    this.notification = new Notification();
    this.handleVarlamov = function(tips) {
      console.log(tips);
      return tips;
    }
    this.gameController = new GameController(this.notification);
    this.state = {
      tips: this.gameController.tips(),
      loading: true
    };
  }

  componentDidMount() {
    this.gameController.createGame().then(() => this.gameController.loadTips()).then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        loading: false
      }, () => {
        createMap('map', this.onMapClick);
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
        tips: this.handleVarlamov(this.gameController.tips())
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  moveNorth = () => {
    this.gameController.goNorth().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips())
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  moveWest = () => {
    this.gameController.goWest().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips())
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  moveSouth = () => {
    this.gameController.goSouth().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips())
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  moveEast = () => {
    this.gameController.goEast().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips())
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  onMapClick = (e) => {
    this.gameController.tryFinish(`${e.latlng.lat}/${e.latlng.lng}`).then(json => {
      this.notification.show(
        'Игра закончена.',
        `Неплохая попытка! Вы оказались по адресу: ${json.data.address}, а промахнулись на ${Math.round(json.data.distance)} метров.`,
        () => {
          window.location = '/';
        }
      );
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
                  <Button onClick={this.moveWest} size="medium">
                    Пройти к западу
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveNorth} size="medium">
                    Пройти к северу
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveSouth} size="medium">
                    Пройти к югу
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveEast} size="medium">
                    Пройти к востоку
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
