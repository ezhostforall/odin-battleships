const Player = require('./player');
const Gameboard = require('./gameboard');
const Ship = require('./ship');

class GameController {
  constructor() {
    this.player1 = new Player('You', 'human');
    this.player2 = new Player('Battleship Bot', 'computer');
    this.currentPlayer = this.player1;
    this.opponent = this.player2;
    this.gamePhase = 'setup'; // 'setup', 'in-progress', 'game-over'
    this.winner = null;
  }

  setupGame() {
    // Example ship placements; in a real game, you'd want to randomize or allow user input
    const ships = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];
    ships.forEach((ship, index) => {
      this.player1.gameboard.placeShip(ship, index, 0, true);
      this.player2.gameboard.placeShip(ship, index, 0, true);
    });
    this.gamePhase = 'in-progress';
  }

  switchTurns() {
    [this.currentPlayer, this.opponent] = [this.opponent, this.currentPlayer];
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getOpponent() {
    return this.opponent;
  }

  processAttack(row, col) {
    const result = this.opponent.gameboard.receiveAttack(row, col);
    if (this.opponent.gameboard.allShipsSunk()) {
      this.gamePhase = 'game-over';
      this.winner = this.currentPlayer;
    } else if (result !== 'already attacked') {
      this.switchTurns();
    }
    return result;
  }

  processComputerTurn() {
    if (this.currentPlayer.type !== 'computer' || this.gamePhase !== 'in-progress') {
      return;
    }
    const result = this.computerAttack();

    if (result !== 'already attacked') {
      if (this.opponent.gameboard.allShipsSunk()) {
        this.gamePhase = 'game-over';
        this.winner = this.currentPlayer;
      } else {
        this.switchTurns();
      }
    }
    return result;
  }

  computerAttack() {
    let row, col, position;
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      position = `${row},${col}`;
    } while (this.opponent.gameboard.attackedPositions.has(position));
    
    return this.opponent.gameboard.receiveAttack(row, col);
  }

  checkGameOver() {
    if (this.gamePhase === 'game-over') {
      return true;
    }
    
    // Only check for game over if we're in the 'in-progress' phase
    if (this.gamePhase !== 'in-progress') {
      return false;
    }
    
    const player1AllSunk = this.player1.gameboard.allShipsSunk();
    const player2AllSunk = this.player2.gameboard.allShipsSunk();
    
    if (player1AllSunk) {
      this.gamePhase = 'game-over';
      this.winner = this.player2;
      return true;
    }
    if (player2AllSunk) {
      this.gamePhase = 'game-over';
      this.winner = this.player1;
      return true;
    }
    return false;
  }
}

module.exports = GameController;