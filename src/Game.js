import React, { Component } from 'react';

import { AppLayout } from './AppLayout';
import logo from './img/cat.png';
import truePlaceIcon from './img/true-place-icon.png';
import { createMap } from './createMap';
import { GameController } from './GameController';
import { Notification } from './Notification';
import Button from '@skbkontur/react-ui/Button';
import * as L from 'leaflet';

const delay = (t = 300) => new Promise(resolve => setTimeout(resolve, t));

export class Game extends Component {
  tipsListRef = React.createRef();

  constructor(props) {
    super(props);
    this.notification = new Notification();
    this.gameController = new GameController(this.notification);
    this.state = {
      tips: this.gameController.tips(),
      loading: true,
      hasMoreTips: this.gameController.hasMoreTips(),
      inProcess: false
    };

    this.noKeys = true;

    document.onkeyup = e => {
      if(this.noKeys) {
        return;
      }
      if (e.code === 'ArrowUp') {
        return this.moveNorth();
      }
      if (e.code === 'ArrowRight') {
        return this.moveEast();
      }
      if (e.code === 'ArrowLeft') {
        return this.moveWest();
      }
      if (e.code === 'ArrowDown') {
        return this.moveSouth();
      }
      if (e.code === 'Enter') {
        return this.askTip();
      }
      if (e.code === 'Space') {
        return this.askTip();
      }
      if (e.code === 'KeyK') {
        return this.moveNorth();
      }
      if (e.code === 'KeyL') {
        return this.moveEast();
      }
      if (e.code === 'KeyH') {
        return this.moveWest();
      }
      if (e.code === 'KeyJ') {
        return this.moveSouth();
      }
    };
  }

  componentDidMount() {
    this.noKeys = true;
    this.gameController.createGame(this.props.city).then(() => this.gameController.loadTips()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        hasMoreTips: this.gameController.hasMoreTips(),
        loading: false,
        inProcess: false
      }, () => {
        createMap('map', this.onMapClick, this.gameController.getBoundaries());
        this.noKeys = false;
      })
    }).catch(error => {
      this.notification.show(
        'Что-то сломалось, зовите разраба',
        error && JSON.stringify(error)
      );
    });
  }

  componentDidUpdate() {
    if(this.tipsListRef && this.tipsListRef.current) {
      this.tipsListRef.current.scrollTop = 10000;
    }
  }

  askTip = () => {
    this.noKeys = true;
    this.setState({
        inProcess: true
    });
    this.gameController.getMoreTips().then(() => delay()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      }, () => {
        this.noKeys = false;
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
    this.noKeys = true;
    this.setState({
        inProcess: true
    });
    this.gameController.goNorth().then(() => delay()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      }, () => {
        this.noKeys = false;
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
    this.noKeys = true;
    this.setState({
        inProcess: true
    });
    this.gameController.goWest().then(() => delay()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      }, () => {
        this.noKeys = false;
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
    this.noKeys = true;
    this.setState({
        inProcess: true
    });
    this.gameController.goSouth().then(() => delay()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      }, () => {
        this.noKeys = false;
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
      this.noKeys = true;
      this.setState({
        inProcess: true
      });
      this.gameController.goEast().then(() => delay()).then(() => {
      this.setState({
        tips: this.gameController.tips(),
        hasMoreTips: this.gameController.hasMoreTips(),
        inProcess: false
      }, () => {
        this.noKeys = false;
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
  };

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
                <ul className="Game-tips-list" ref={this.tipsListRef}>
                  {this.state.tips.map((tip, i) => <li key={tip + i}>{tip}</li>)}
                  {this.state.inProcess && <li style={{ color: 'rgba(0, 0, 0, 0.4)' }}><b>...колдуем подсказку</b></li>}
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
                  <div>
                    <div className="Game-controls">
                      <div className="Get-button" style={{
                        width: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Button onClick={this.askTip} size="large" disabled={this.state.inProcess || !this.state.hasMoreTips}>
                          Осмотреться
                        </Button>
                      </div>
                      <div style={{
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <div className="Game-controls" style={{
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          <div className="Get-button">
                            <Button onClick={this.moveNorth} disabled={this.state.inProcess}>
                              Пройти к северу
                            </Button>
                          </div>
                        </div>
                        <div className="Game-controls" style={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          flexWrap: 'wrap'
                        }}>
                          <div className="Get-button">
                            <Button onClick={this.moveWest} disabled={this.state.inProcess}>
                              Пройти к западу
                            </Button>
                          </div>
                          <div className="Get-button">
                            <Button onClick={this.moveEast} disabled={this.state.inProcess}>
                              Пройти к востоку
                            </Button>
                          </div>
                        </div>
                        <div className="Game-controls" style={{
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          <div className="Get-button">
                            <Button onClick={this.moveSouth} disabled={this.state.inProcess}>
                              Пройти к югу
                            </Button>
                          </div>
                        </div>
                      </div>
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
