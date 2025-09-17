
class Gameboard {
  constructor() {
    this.board = this.createBoard();
    this.ships = [];
    this.misses = [];
    this.attackedPositions = new Set();
  } 

  createBoard() {
    const board = [];
    for (let i = 0; i < 10; i++) {
      const row = new Array(10).fill(null);
      board.push(row);
    }
    return board;
  }

  placeShip(ship, row, col, isHorizontal) {
    const length = ship.length;
    for (let i = 0; i < length; i++) {
      if (isHorizontal) {
        this.board[row][col + i] = ship;
      } else {
        this.board[row + i][col] = ship;
      }
    }
    this.ships.push(ship);
    return true;
  }

  receiveAttack(row, col) {
    const position = `${row},${col}`;

    if (this.misses.includes(position)) {
      return 'already attacked';
    }

    this.attackedPositions.add(position);
    const ship = this.board[row][col];
    if (ship) {
      ship.hit();
      return ship.sunk ? 'sunk' : 'hit';
    } else {
      this.misses.push(position);
      return 'miss';
    }
  }


}

module.exports = Gameboard;