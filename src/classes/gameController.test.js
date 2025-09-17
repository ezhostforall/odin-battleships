const Player = require('./player');
const Gameboard = require('./gameboard');
const Ship = require('./ship');
const GameController = require('./gameController');

describe('GameController', () => {
  let gameController;
  
  beforeEach(() => {
    gameController = new GameController();
  });

  test('should create a GameController instance', () => {
    expect(gameController).toBeInstanceOf(GameController);
  });

  test('should initialize two players with gameboards', () => {
    expect(gameController.player1).toBeInstanceOf(Player);
    expect(gameController.player2).toBeInstanceOf(Player);
    expect(gameController.player1.gameboard).toBeInstanceOf(Gameboard);
    expect(gameController.player2.gameboard).toBeInstanceOf(Gameboard);
  });

  test('should set the current player and opponent correctly', () => {
    expect(gameController.currentPlayer).toBe(gameController.player1);
    expect(gameController.opponent).toBe(gameController.player2);
  });

  test('should set up the game with ships placed on both players\' boards', () => {
    gameController.setupGame();
    expect(gameController.player1.gameboard.ships.length).toBeGreaterThan(0);
    expect(gameController.player2.gameboard.ships.length).toBeGreaterThan(0);
  });

  test('should place ships correctly on the gameboards', () => {
    gameController.setupGame();
    const player1Ships = gameController.player1.gameboard.ships;
    const player2Ships = gameController.player2.gameboard.ships;

    player1Ships.forEach(ship => {
      expect(ship).toBeDefined();
      expect(ship.length).toBeGreaterThan(0);
    });

    player2Ships.forEach(ship => {
      expect(ship).toBeDefined();
      expect(ship.length).toBeGreaterThan(0);
    });
  });

  test('should not allow overlapping ships on the gameboard', () => {
    const ship1 = new Ship(3);
    const ship2 = new Ship(4);

    const place1 = gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
    const place2 = gameController.player1.gameboard.placeShip(ship2, 0, 0, false);

    expect(place1).toBe(true);
    expect(place2).toBe(false);
  });

  test('should not allow ships to be placed out of bounds', () => {
    const ship = new Ship(5);
    const place = gameController.player1.gameboard.placeShip(ship, 9, 6, true);
    expect(place).toBe(false);
  });

  test('should handle attacks between players', () => {
    gameController.setupGame();
    const attackResult = gameController.opponent.gameboard.receiveAttack(0, 0);
    expect(['hit', 'miss', 'sunk', 'already attacked']).toContain(attackResult);
  });

  test('should switch turns between players', () => {
    const initialCurrentPlayer = gameController.currentPlayer;
    const initialOpponent = gameController.opponent;

    gameController.switchTurns();

    expect(gameController.currentPlayer).toBe(initialOpponent);
    expect(gameController.opponent).toBe(initialCurrentPlayer);
  });

  test('should get the current player and opponent correctly', () => {
    expect(gameController.getCurrentPlayer()).toBe(gameController.player1);
    expect(gameController.getOpponent()).toBe(gameController.player2);

    gameController.switchTurns();

    expect(gameController.getCurrentPlayer()).toBe(gameController.player2);
    expect(gameController.getOpponent()).toBe(gameController.player1);
  });

  test('should register a hit on a ship', () => {
    const ship = new Ship(3);
    gameController.player1.gameboard.placeShip(ship, 0, 0, true);

    const result = gameController.player1.gameboard.receiveAttack(0, 0);
    expect(result).toBe('hit');
    expect(ship.hits).toBe(1);
  });

  test('should register a miss when attacking an empty coordinate', () => {
    const result = gameController.player1.gameboard.receiveAttack(5, 5);
    expect(result).toBe('miss');
    expect(gameController.player1.gameboard.misses).toContainEqual('5,5');
  });

  test('should not register an attack on the same coordinate twice', () => {
    gameController.player1.gameboard.receiveAttack(4, 4);
    const result = gameController.player1.gameboard.receiveAttack(4, 4);
    expect(result).toBe('already attacked');
    expect(gameController.player1.gameboard.misses.length).toBe(1);
  });

  test('should return "sunk" when a ship is sunk after attack', () => {
    const ship = new Ship(1);
    gameController.player1.gameboard.placeShip(ship, 0, 0, true);
    const result = gameController.player1.gameboard.receiveAttack(0, 0);
    expect(result).toBe('sunk');
    expect(ship.sunk).toBe(true);
  });

  test('should track attacked positions', () => {
    const gameboard = new Gameboard();
    gameboard.receiveAttack(3, 4);
    expect(gameboard.attackedPositions.has('3,4')).toBe(true);
  });

  test('should return true when all ships are sunk', () => {
    const ship1 = new Ship(1);
    const ship2 = new Ship(2);
    gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
    gameController.player1.gameboard.placeShip(ship2, 1, 0, true);

    // Sink ship1
    gameController.player1.gameboard.receiveAttack(0, 0);
    // Sink ship2
    gameController.player1.gameboard.receiveAttack(1, 0);
    gameController.player1.gameboard.receiveAttack(1, 1);

    expect(gameController.player1.gameboard.allShipsSunk()).toBe(true);
  });

  test('should return false when not all ships are sunk', () => {
    const ship1 = new Ship(1);
    const ship2 = new Ship(2);
    gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
    gameController.player1.gameboard.placeShip(ship2, 1, 0, true);

    // Sink only ship1
    gameController.player1.gameboard.receiveAttack(0, 0);

    expect(gameController.player1.gameboard.allShipsSunk()).toBe(false);
  });

  test('should handle the computer player making random attacks', () => {
    gameController.setupGame();
    const result = gameController.computerAttack();
    expect(['hit', 'miss', 'sunk']).toContain(result);
  });

  test('should ensure computer does not attack the same position twice', () => {
    gameController.setupGame();
    const attackedPositions = new Set();

    for (let i = 0; i < 20; i++) {
      const result = gameController.computerAttack();
      expect(['hit', 'miss', 'sunk']).toContain(result);

      const lastAttack = Array.from(gameController.opponent.gameboard.attackedPositions).pop();
      expect(attackedPositions.has(lastAttack)).toBe(false);
      attackedPositions.add(lastAttack);
    }
  });

  test('should ensure computer attacks are within board bounds', () => {
    gameController.setupGame();

    for (let i = 0; i < 20; i++) {
      gameController.computerAttack();
      const lastAttack = Array.from(gameController.opponent.gameboard.attackedPositions).pop();
      const [row, col] = lastAttack.split(',').map(Number);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(10);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(10);
    }
  });

  test('should process an attack and switch turns if the game is still in progress', () => {
    gameController.setupGame();

    const initialCurrentPlayer = gameController.currentPlayer;
    const initialOpponent = gameController.opponent;

    const response = gameController.processAttack(0, 0);
    expect(response.success).toBe(true);
    expect(['hit', 'miss', 'sunk']).toContain(response.result);

    if (gameController.gamePhase === 'in-progress') {
      expect(gameController.currentPlayer).toBe(initialOpponent);
      expect(gameController.opponent).toBe(initialCurrentPlayer);
    } else {
      expect(gameController.gamePhase).toBe('game-over');
      expect(gameController.winner).toBeDefined();
    }
  });

  test('should process the computer turn and switch turns if the game is still in progress', () => {
    gameController.setupGame();

    // Ensure it's the computer's turn
    if (gameController.currentPlayer.type !== 'computer') {
      gameController.switchTurns();
    }

    const initialCurrentPlayer = gameController.currentPlayer;
    const initialOpponent = gameController.opponent;

    const response = gameController.processComputerTurn();
    expect(response.success).toBe(true);
    expect(['hit', 'miss', 'sunk', 'already attacked']).toContain(response.result);

    if (response.result !== 'already attacked') {
      if (gameController.gamePhase === 'in-progress') {
        expect(gameController.currentPlayer).toBe(initialOpponent);
        expect(gameController.opponent).toBe(initialCurrentPlayer);
      } else {
        expect(gameController.gamePhase).toBe('game-over');
        expect(gameController.winner).toBeDefined();
      }
    } else {
      expect(gameController.currentPlayer).toBe(initialCurrentPlayer);
      expect(gameController.opponent).toBe(initialOpponent);
    }
  });

  test('should check for game over condition correctly', () => {
    gameController.setupGame();
    
    // Clear the existing ships and place our test ships
    gameController.player1.gameboard.ships = [];
    gameController.player1.gameboard.board = gameController.player1.gameboard.createBoard();
    
    const ship1 = new Ship(1);
    const ship2 = new Ship(2);
    gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
    gameController.player1.gameboard.placeShip(ship2, 1, 0, true);

    // Sink all ships of player1
    gameController.player1.gameboard.receiveAttack(0, 0);
    gameController.player1.gameboard.receiveAttack(1, 0);
    gameController.player1.gameboard.receiveAttack(1, 1);

    const isGameOver = gameController.checkGameOver();
    expect(isGameOver).toBe(true);
    expect(gameController.gamePhase).toBe('game-over');
    expect(gameController.winner).toBe(gameController.player2);
  });

  test('should not declare game over if not all ships are sunk', () => {
    gameController.setupGame();
    
    // Clear the existing ships and place our test ships
    gameController.player1.gameboard.ships = [];
    gameController.player1.gameboard.board = gameController.player1.gameboard.createBoard();
    
    const ship1 = new Ship(1);
    const ship2 = new Ship(2);
    gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
    gameController.player1.gameboard.placeShip(ship2, 1, 0, true);

    // Sink only one ship of player1
    gameController.player1.gameboard.receiveAttack(0, 0);

    const isGameOver = gameController.checkGameOver();
    expect(isGameOver).toBe(false);
    expect(gameController.gamePhase).toBe('in-progress');
    expect(gameController.winner).toBeNull();
  });

  test('should have receiveAttack method with correct parameters', () => {
    const gameboard = new Gameboard();
    expect(typeof gameboard.receiveAttack).toBe('function');
    expect(gameboard.receiveAttack.length).toBe(2);
  });

  // New tests for enhanced GameController functionality
  test('should start a new game correctly', () => {
    const result = gameController.startNewGame();
    expect(result.success).toBe(true);
    expect(result.gamePhase).toBe('placing-ships');
    expect(gameController.player2.gameboard.ships.length).toBe(5);
  });

  test('should handle manual ship placement', () => {
    gameController.startNewGame();
    
    const result = gameController.placePlayerShip(0, 0, 0, true); // Place Carrier
    expect(result.success).toBe(true);
    expect(gameController.player1.gameboard.ships.length).toBe(1);
  });

  test('should handle quick setup', () => {
    gameController.startNewGame();
    
    const result = gameController.quickSetup();
    expect(result.success).toBe(true);
    expect(result.gamePhase).toBe('in-progress');
    expect(gameController.player1.gameboard.ships.length).toBe(5);
  });

  test('should get game state correctly', () => {
    gameController.setupGame();
    
    const gameState = gameController.getGameState();
    expect(gameState).toHaveProperty('gamePhase');
    expect(gameState).toHaveProperty('currentPlayer');
    expect(gameState).toHaveProperty('player1');
    expect(gameState).toHaveProperty('player2');
    expect(gameState.player1.board).toBeDefined();
    expect(gameState.player2.board).toBeDefined();
  });
});