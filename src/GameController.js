import { api } from './api';
import deepEq from 'fast-deep-equal';

export class GameController {
  constructor(notification) {
    this.notification = notification;
  }

  createGame() {
    return api.post('/games').then(json => {
      this.gameId = json.data.game_id;
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
}
