import Gameboard from './gameboard.js';

class Player {
  constructor(name='Human Player', type='human') {
    this.name = name;
    this.type = type; // 'human' or 'computer'
    this.gameboard = new Gameboard();
  }
}

export default Player;