import { api } from './api';
import deepEq from 'fast-deep-equal';

export class GameController {
  constructor(notification) {
    this.varlamov = true;
    this.notification = notification;
  }

  createGame(city) {
    return api.post('/games', {city: city}).then(json => {
      this.gameId = json.data.game_id;
      this.minLat = json.data.min_lat;
      this.maxLat = json.data.max_lat;
      this.minLon = json.data.min_lon;
      this.maxLon = json.data.max_lon;
    });
  }

  loadTips() {
    return api.get(`/games/${this.gameId}/tips`).then(json => {
      this._tips = json.data.tips;
      this._hasMoreTips = json.data.hasMore;
    });
  }

  goNorth() {
    return api.post(`/games/${this.gameId}/move/north`).then(json => {
      this._tips = json.data.tips;
      this._hasMoreTips = json.data.hasMore;
    })
  }

  goWest() {
    return api.post(`/games/${this.gameId}/move/west`).then(json => {
      this._tips = json.data.tips;
      this._hasMoreTips = json.data.hasMore;
    })
  }

  goSouth() {
    return api.post(`/games/${this.gameId}/move/south`).then(json => {
      this._tips = json.data.tips;
      this._hasMoreTips = json.data.hasMore;
    })
  }

  goEast() {
    return api.post(`/games/${this.gameId}/move/east`).then(json => {
      this._tips = json.data.tips;
      this._hasMoreTips = json.data.hasMore;
    })
  }

  tips() {
    if(!this._tips) {
      return [];
    }
    if(this.varlamov) {
      const match = this._tips[this._tips.length - 1].match(/высотой в (.) этажей/);
      if(match && match[1]) {
        const num = parseInt(match[1], 10);
        if(num > 5) {
          const el = document.querySelector('.Game-frame');
          if(el) {
            el.classList.add('varlamov-on');
            setTimeout(() => {
              el.classList.remove('varlamov-on');
            }, 10000);
            this.varlamov = false;
          }
        }
      }
    }
    return this._tips;
  }

  hasMoreTips() {
    if(!this._tips) {
        return true;
    }
    return this._hasMoreTips;
  }

  getMoreTips() {
    return api.post(`/games/${this.gameId}/ask-tip`).then(json => {
      if(deepEq(json.data.tips, this.tips())) {
        this.notification.show('Ничего нового, пора идти дальше!');
        return;
      }
      this._tips = json.data.tips;
      this._hasMoreTips = json.data.hasMore;
    });
  }

  tryFinish(ltLng) {
    return api.post(`/games/${this.gameId}/finish/${ltLng}`);
  }

  getBoundaries() {
    return [[this.minLat, this.minLon], [this.maxLat, this.maxLon]];
  }
}
