
class Gameboard {
  constructor() {
    this.board = this.createBoard();
    this.ships = [];
    this.misses = [];
  } 

  createBoard() {
    const board = [];
    for (let i = 0; i < 10; i++) {
      const row = new Array(10).fill(null);
      board.push(row);
    }
    return board;
  }


}

module.exports = Gameboard;