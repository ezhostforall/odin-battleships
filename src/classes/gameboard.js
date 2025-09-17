
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
    if (!this.checkCanPlaceShip(ship, row, col, isHorizontal)) {
      return false;
    }
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

  checkCanPlaceShip(ship, row, col, isHorizontal) {
    const length = ship.length;
    if (isHorizontal) {
      if (col + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (this.board[row][col + i] !== null) return false;
      }
    } else {
      if (row + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (this.board[row + i][col] !== null) return false;
      }
    }
    return true;
  }

  receiveAttack(row, col) {
    const position = `${row},${col}`;

    if (this.attackedPositions.has(position)) {
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

  allShipsSunk() {
    return this.ships.every(ship => ship.sunk);
  }


}

module.exports = Gameboard;