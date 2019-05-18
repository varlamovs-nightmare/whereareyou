import { api } from './api';

export class GameController {
  createGame() {
    return api.post('/games').then(json => {
      this.gameId = json.data.game_id;
    });
  }

  loadTips() {
    return api.get(`/games/${this.gameId}/tips`).then(json => {
      this._tips = json.data.tips;
    });
  }

  tips() {
    if(!this._tips) {
      return [];
    }
    return this._tips;
  }

  getMoreTips() {
    return api.post(`/games/${this.gameId}/ask-tip`).then(json => {
      this._tips = json.data.tips;
    });
  }
}