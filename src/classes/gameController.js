import Player from './player.js';
import Gameboard from './gameboard.js';
import Ship from './ship.js';

class GameController {
  constructor() {
    this.player1 = new Player('You', 'human');
    this.player2 = new Player('Battleship Bot', 'computer');
    this.currentPlayer = this.player1;
    this.opponent = this.player2;
    this.gamePhase = 'setup'; // 'setup', 'placing-ships', 'in-progress', 'game-over'
    this.winner = null;
    this.gameHistory = [];
    this.shipTypes = [
      { name: 'Carrier', length: 5 },
      { name: 'Battleship', length: 4 },
      { name: 'Cruiser', length: 3 },
      { name: 'Submarine', length: 3 },
      { name: 'Destroyer', length: 2 }
    ];
  }

  // Generate ships based on standard Battleship rules
  generateShips() {
    return this.shipTypes.map(shipType => new Ship(shipType.length, shipType.name));
  }

  // Initialize a new game
  startNewGame() {
    // Reset players
    this.player1 = new Player('You', 'human');
    this.player2 = new Player('Battleship Bot', 'computer');
    this.currentPlayer = this.player1;
    this.opponent = this.player2;
    this.gamePhase = 'placing-ships';
    this.winner = null;
    this.gameHistory = [];
    
    // Auto-place ships for computer player
    this.autoPlaceShips(this.player2);
    
    return {
      success: true,
      message: 'New game started. Place your ships to begin!',
      gamePhase: this.gamePhase
    };
  }

  // Auto-place ships randomly for a player (used for computer or quick setup)
  autoPlaceShips(player) {
    const ships = this.generateShips();
    const maxAttempts = 100;
    
    ships.forEach(ship => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() > 0.5;
        
        if (player.gameboard.placeShip(ship, row, col, isHorizontal)) {
          placed = true;
        }
        attempts++;
      }
      
      if (!placed) {
        throw new Error(`Could not place ship ${ship.name} after ${maxAttempts} attempts`);
      }
    });
  }

  // Manual ship placement for human player
  placePlayerShip(shipIndex, row, col, isHorizontal) {
    if (this.gamePhase !== 'placing-ships') {
      return { success: false, message: 'Not in ship placement phase' };
    }
    
    if (shipIndex < 0 || shipIndex >= this.shipTypes.length) {
      return { success: false, message: 'Invalid ship index' };
    }
    
    // Check if this ship has already been placed
    if (this.player1.gameboard.ships.length > shipIndex) {
      return { success: false, message: 'Ship already placed' };
    }
    
    const shipType = this.shipTypes[shipIndex];
    const ship = new Ship(shipType.length, shipType.name);
    
    const placed = this.player1.gameboard.placeShip(ship, row, col, isHorizontal);
    
    if (placed) {
      // Check if all ships are placed
      if (this.player1.gameboard.ships.length === this.shipTypes.length) {
        this.gamePhase = 'in-progress';
        return { 
          success: true, 
          message: 'All ships placed! Game begins!',
          gamePhase: this.gamePhase,
          allShipsPlaced: true
        };
      }
      
      return { 
        success: true, 
        message: `${ship.name} placed successfully`,
        shipsPlaced: this.player1.gameboard.ships.length,
        totalShips: this.shipTypes.length
      };
    } else {
      return { success: false, message: 'Cannot place ship at that location' };
    }
  }

  // Quick setup - auto place ships for human player too
  quickSetup() {
    this.autoPlaceShips(this.player1);
    this.gamePhase = 'in-progress';
    
    return {
      success: true,
      message: 'Ships auto-placed for both players. Game ready!',
      gamePhase: this.gamePhase
    };
  }

  // Get current game state for UI
  getGameState() {
    return {
      gamePhase: this.gamePhase,
      currentPlayer: this.currentPlayer.name,
      currentPlayerType: this.currentPlayer.type,
      winner: this.winner ? this.winner.name : null,
      player1: {
        name: this.player1.name,
        shipsRemaining: this.player1.gameboard.ships.filter(ship => !ship.sunk).length,
        totalShips: this.player1.gameboard.ships.length,
        board: this.getPlayerBoardState(this.player1)
      },
      player2: {
        name: this.player2.name,
        shipsRemaining: this.player2.gameboard.ships.filter(ship => !ship.sunk).length,
        totalShips: this.player2.gameboard.ships.length,
        board: this.getPlayerBoardState(this.player2, false) // Don't reveal computer ships
      },
      shipTypes: this.shipTypes,
      gameHistory: this.gameHistory
    };
  }

  // Get board state for UI (with visibility control)
  getPlayerBoardState(player, revealShips = true) {
    const board = [];
    
    for (let row = 0; row < 10; row++) {
      const boardRow = [];
      for (let col = 0; col < 10; col++) {
        const position = `${row},${col}`;
        const cell = player.gameboard.board[row][col];
        const isAttacked = player.gameboard.attackedPositions.has(position);
        
        let cellState = 'empty';
        
        if (isAttacked) {
          if (cell) {
            cellState = cell.sunk ? 'sunk' : 'hit';
          } else {
            cellState = 'miss';
          }
        } else if (revealShips && cell) {
          cellState = 'ship';
        }
        
        boardRow.push({
          row,
          col,
          state: cellState,
          ship: cell ? { name: cell.name, length: cell.length, hits: cell.hits, sunk: cell.sunk } : null,
          attacked: isAttacked
        });
      }
      board.push(boardRow);
    }
    
    return board;
  }

  // Run the main game loop
  runGame() {
    if (this.gamePhase !== 'in-progress') {
      return { success: false, message: 'Game not in progress' };
    }
    
    // If it's the computer's turn, process it automatically
    if (this.currentPlayer.type === 'computer') {
      return this.processComputerTurn();
    }
    
    return { 
      success: true, 
      message: 'Waiting for human player input',
      gameState: this.getGameState()
    };
  }

  // Enhanced processAttack with better feedback
  processAttack(row, col) {
    if (this.gamePhase !== 'in-progress') {
      return { success: false, message: 'Game not in progress' };
    }
    
    if (this.currentPlayer.type !== 'human') {
      return { success: false, message: 'Not human player turn' };
    }
    
    const result = this.opponent.gameboard.receiveAttack(row, col);
    
    // Add to game history
    this.gameHistory.push({
      player: this.currentPlayer.name,
      row,
      col,
      result,
      turn: this.gameHistory.length + 1
    });
    
    let message = '';
    switch (result) {
      case 'hit':
        message = 'Hit!';
        break;
      case 'miss':
        message = 'Miss!';
        break;
      case 'sunk':
        message = 'You sunk their ship!';
        break;
      case 'already attacked':
        message = 'You already attacked that position!';
        break;
    }
    
    if (this.opponent.gameboard.allShipsSunk()) {
      this.gamePhase = 'game-over';
      this.winner = this.currentPlayer;
      message += ' You win!';
    } else if (result !== 'already attacked') {
      this.switchTurns();
    }
    
    return {
      success: true,
      result,
      message,
      gameState: this.getGameState()
    };
  }

  // Enhanced computer turn processing
  processComputerTurn() {
    if (this.currentPlayer.type !== 'computer' || this.gamePhase !== 'in-progress') {
      return { success: false, message: 'Not computer turn or game not in progress' };
    }
    
    const result = this.computerAttack();
    
    // Add to game history
    const lastAttack = this.getLastComputerAttack();
    this.gameHistory.push({
      player: this.currentPlayer.name,
      row: lastAttack.row,
      col: lastAttack.col,
      result,
      turn: this.gameHistory.length + 1
    });
    
    let message = '';
    switch (result) {
      case 'hit':
        message = 'Computer hit your ship!';
        break;
      case 'miss':
        message = 'Computer missed!';
        break;
      case 'sunk':
        message = 'Computer sunk your ship!';
        break;
    }

    if (result !== 'already attacked') {
      if (this.opponent.gameboard.allShipsSunk()) {
        this.gamePhase = 'game-over';
        this.winner = this.currentPlayer;
        message += ' Computer wins!';
      } else {
        this.switchTurns();
      }
    }
    
    return {
      success: true,
      result,
      message,
      attack: lastAttack,
      gameState: this.getGameState()
    };
  }

  // Helper to get the last computer attack coordinates
  getLastComputerAttack() {
    // Since computerAttack() generates random coordinates, we need to track them
    // This is a simplified version - in a real implementation you'd want to store this
    const attackedPositions = Array.from(this.opponent.gameboard.attackedPositions);
    const lastPosition = attackedPositions[attackedPositions.length - 1];
    if (lastPosition) {
      const [row, col] = lastPosition.split(',').map(Number);
      return { row, col };
    }
    return { row: 0, col: 0 };
  }

  setupGame() {
    // Legacy method - keeping for backward compatibility
    const ships = this.generateShips();
    ships.forEach((ship, index) => {
      this.player1.gameboard.placeShip(ship, index, 0, true);
    });
    
    this.autoPlaceShips(this.player2);
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
    
    if (this.gamePhase === 'setup' || this.gamePhase === 'in-progress') {
      const player1AllSunk = this.player1.gameboard.allShipsSunk();
      const player2AllSunk = this.player2.gameboard.allShipsSunk();
      
      const player1HasShips = this.player1.gameboard.ships.length > 0;
      const player2HasShips = this.player2.gameboard.ships.length > 0;
      
      if (player1HasShips && player1AllSunk) {
        this.gamePhase = 'game-over';
        this.winner = this.player2;
        return true;
      }
      if (player2HasShips && player2AllSunk) {
        this.gamePhase = 'game-over';
        this.winner = this.player1;
        return true;
      }
    }
    
    return false;
  }
}

export default GameController;