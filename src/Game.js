import React, { Component } from 'react';

import { AppLayout } from './AppLayout';
import logo from './img/cat.png';
import varlamov from './img/varlamov.png';
import truePlaceIcon from './img/true-place-icon.png';
import { createMap } from './createMap';
import { GameController } from './GameController';
import { Notification } from './Notification';
import Button from '@skbkontur/react-ui/Button';
import * as L from 'leaflet';

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
      loading: true,
      hasMoreTips: this.gameController.hasMoreTips()
    };
  }

  componentDidMount() {
    this.gameController.createGame(this.props.city).then(() => this.gameController.loadTips()).then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        hasMoreTips: this.gameController.hasMoreTips(),
        loading: false,
        inProcess: false
      }, () => {
        createMap('map', this.onMapClick, this.gameController.getBoundaries());
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  }

  askTip = () => {
    this.setState({
        inProcess: true
    });
    this.gameController.getMoreTips().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      })
    }).catch(error => {
      this.setState({
        inProcess: false
      });
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  };

  moveNorth = () => {
    this.setState({
        inProcess: true
    });
    this.gameController.goNorth().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
      this.setState({
        inProcess: false
      });
    });
  };

  moveWest = () => {
    this.setState({
        inProcess: true
    });
    this.gameController.goWest().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
      this.setState({
        inProcess: false
      });
    });
  };

  moveSouth = () => {
    this.setState({
        inProcess: true
    });
    this.gameController.goSouth().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
      this.setState({
        inProcess: false
      });
    });
  };

  moveEast = () => {
      this.setState({
        inProcess: true
      });
      this.gameController.goEast().then(() => {
      this.setState({
        tips: this.handleVarlamov(this.gameController.tips()),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
      this.setState({
        inProcess: false
      });
    });
  };

  startNewGame = () => {
    window.location = '/';
  }

  onMapClick = (e, map) => {

    if (this.state.isFinished) return;

    this.gameController.tryFinish(`${e.latlng.lat}/${e.latlng.lng}`).then(json => {

      var greenIcon = L.icon({
        iconUrl: truePlaceIcon,

        iconSize:     [25, 41],
        iconAnchor:   [13, 41]
      });


      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      L.polyline([[e.latlng.lat, e.latlng.lng], [json.data.right_coordinates[0], json.data.right_coordinates[1]]], {color: 'green'}).addTo(map);
      L.polyline(json.data.route, {color: 'red'}).addTo(map);
      L.marker([json.data.right_coordinates[0], json.data.right_coordinates[1]], {icon: greenIcon}).addTo(map);

      this.notification.show(
        'Игра закончена.',
        `Неплохая попытка! Вы оказались по адресу: ${json.data.address}, промахнулись на ${Math.round(json.data.distance)} метров и заработали ${Math.round(json.data.score)} очков.`,
        () => {

          this.setState({
            isFinished: true
          })
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


                {this.state.isFinished && (
                  <div className="Game-controls">
                    <div className="Get-button">
                      <Button onClick={this.startNewGame} size="medium">
                        Начать новую игру
                      </Button>
                    </div>
                    </div>
                )}

                {!this.state.isFinished && (

              <div className="Game-controls">
                <div className="Get-button">
                  <Button onClick={this.askTip} size="medium" disabled={this.state.inProcess || !this.state.hasMoreTips}>
                    Осмотреться
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveWest} size="medium" disabled={this.state.inProcess}>
                    Пройти к западу
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveNorth} size="medium" disabled={this.state.inProcess}>
                    Пройти к северу
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveSouth} size="medium" disabled={this.state.inProcess}>
                    Пройти к югу
                  </Button>
                </div>
                <div className="Get-button">
                  <Button onClick={this.moveEast} size="medium" disabled={this.state.inProcess}>
                    Пройти к востоку
                  </Button>
                </div>
              </div>

                )}

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
