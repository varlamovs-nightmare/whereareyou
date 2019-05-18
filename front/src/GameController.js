import { api } from './api';

export class GameController {
  createGame() {
    return api.post('/games').then(json => {
      this.gameId = json.game_id;
    });
  }

  loadTips() {
    return api.get(`/games/${this.gameId}/tips`).then(json => {
      this.tips = json.tips;
    });
  }

  tips() {
    if(!this.tips) {
      return [];
    }
    return this.tips;
  }
}