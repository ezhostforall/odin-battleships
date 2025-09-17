
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

  placeShip(ship, start, end) {
    const [startX, startY] = start;
    const [endX, endY] = end;

    if (startX === endX) {
      // Vertical placement
      for (let y = startY; y <= endY; y++) {
        this.board[startX][y] = ship;
      }
    } else if (startY === endY) {
      // Horizontal placement
      for (let x = startX; x <= endX; x++) {
        this.board[x][startY] = ship;
      }
    }
    this.ships.push(ship);
  }


}

module.exports = Gameboard;