const Player = require('./player');
const Gameboard = require('./gameboard');
const Ship = require('./ship');
const GameController = require('./gameController');

it('should create a GameController instance', () => {
  const gameController = new GameController();
  expect(gameController).toBeInstanceOf(GameController);
});

it('should initialize two players with gameboards', () => {
  const gameController = new GameController();
  expect(gameController.player1).toBeInstanceOf(Player);
  expect(gameController.player2).toBeInstanceOf(Player);
  expect(gameController.player1.gameboard).toBeInstanceOf(Gameboard);
  expect(gameController.player2.gameboard).toBeInstanceOf(Gameboard);
});

it('should set the current player and opponent correctly', () => {
  const gameController = new GameController();
  expect(gameController.currentPlayer).toBe(gameController.player1);
  expect(gameController.opponent).toBe(gameController.player2);
});

it('should set up the game with ships placed on both players\' boards', () => {
  const gameController = new GameController();
  gameController.setupGame();
  expect(gameController.player1.gameboard.ships.length).toBeGreaterThan(0);
  expect(gameController.player2.gameboard.ships.length).toBeGreaterThan(0);
});

it('should place ships correctly on the gameboards', () => {
  const gameController = new GameController();
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

it('should not allow overlapping ships on the gameboard', () => {
  const gameController = new GameController();
  const ship1 = new Ship(3);
  const ship2 = new Ship(4);

  const place1 = gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
  const place2 = gameController.player1.gameboard.placeShip(ship2, 0, 0, false); // Overlaps with ship1

  expect(place1).toBe(true);
  expect(place2).toBe(false); // Should fail due to overlap
});

it('should not allow ships to be placed out of bounds', () => {
  const gameController = new GameController();
  const ship = new Ship(5);

  const place = gameController.player1.gameboard.placeShip(ship, 9, 6, true); // Out of bounds

  expect(place).toBe(false); // Should fail due to out of bounds
});

it('should handle attacks between players', () => {
  const gameController = new GameController();
  gameController.setupGame();

  const attackResult = gameController.opponent.gameboard.receiveAttack(0, 0);
  expect(['hit', 'miss', 'sunk']).toContain(attackResult);
});

it('should switch turns between players', () => {
  const gameController = new GameController();
  const initialCurrentPlayer = gameController.currentPlayer;
  const initialOpponent = gameController.opponent;

  // Simulate turn switch
  gameController.switchTurns();

  expect(gameController.currentPlayer).toBe(initialOpponent);
  expect(gameController.opponent).toBe(initialCurrentPlayer);
});

it('should get the current player and opponent correctly', () => {
  const gameController = new GameController();
  expect(gameController.getCurrentPlayer()).toBe(gameController.player1);
  expect(gameController.getOpponent()).toBe(gameController.player2);

  gameController.switchTurns();

  expect(gameController.getCurrentPlayer()).toBe(gameController.player2);
  expect(gameController.getOpponent()).toBe(gameController.player1);
});

it('should register a hit on a ship', () => {
  const gameController = new GameController();
  const ship = new Ship(3);
  gameController.player1.gameboard.placeShip(ship, 0, 0, true);

  const result = gameController.player1.gameboard.receiveAttack(0, 0);
  expect(result).toBe('hit');
  expect(ship.hits).toBe(1);
});

it('should register a miss when attacking an empty coordinate', () => {
  const gameController = new GameController();
  const result = gameController.player1.gameboard.receiveAttack(5, 5);
  expect(result).toBe('miss');
  expect(gameController.player1.gameboard.misses).toContainEqual('5,5');
});

it('should not register an attack on the same coordinate twice', () => {
  const gameController = new GameController();
  gameController.player1.gameboard.receiveAttack(4, 4);
  const result = gameController.player1.gameboard.receiveAttack(4, 4);
  expect(result).toBe('already attacked');
  expect(gameController.player1.gameboard.misses.length).toBe(1);
});

it('should return "sunk" when a ship is sunk after attack', () => {
  const gameController = new GameController();
  const ship = new Ship(1);
  ship.sunk = true;
  gameController.player1.gameboard.placeShip(ship, 0, 0, true);
  const result = gameController.player1.gameboard.receiveAttack(0, 0);
  expect(result).toBe('sunk');
});

it('should track attacked positions', () => {
  const gameboard = new Gameboard();
  gameboard.receiveAttack(3, 4);
  expect(gameboard.attackedPositions.has('3,4')).toBe(true);
});

it('should return true when all ships are sunk', () => {
  const gameController = new GameController();
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

it('should return false when not all ships are sunk', () => {
  const gameController = new GameController();
  const ship1 = new Ship(1);
  const ship2 = new Ship(2);
  gameController.player1.gameboard.placeShip(ship1, 0, 0, true);
  gameController.player1.gameboard.placeShip(ship2, 1, 0, true);

  // Sink only ship1
  gameController.player1.gameboard.receiveAttack(0, 0);

  expect(gameController.player1.gameboard.allShipsSunk()).toBe(false);
});

it('should handle the computer player making random attacks', () => {
  const gameController = new GameController();
  gameController.setupGame();

  // Simulate computer attack
  gameController.computerAttack();

  const result = gameController.computerAttack();

  expect(['hit', 'miss', 'sunk']).toContain(result);
});

it('should ensure computer does not attack the same position twice', () => {
  const gameController = new GameController();
  gameController.setupGame();

  const attackedPositions = new Set();

  for (let i = 0; i < 20; i++) {
    const result = gameController.computerAttack();
    expect(['hit', 'miss', 'sunk']).toContain(result);

    // Check that the attacked position is unique
    const lastAttack = Array.from(gameController.opponent.gameboard.attackedPositions).pop();
    expect(attackedPositions.has(lastAttack)).toBe(false);
    attackedPositions.add(lastAttack);
  }
});

it('should ensure computer attacks are within board bounds', () => {
  const gameController = new GameController();
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

it('should process an attack and switch turns if the game is still in progress', () => {
  const gameController = new GameController();
  gameController.setupGame();

  const initialCurrentPlayer = gameController.currentPlayer;
  const initialOpponent = gameController.opponent;

  const result = gameController.processAttack(0, 0);
  expect(['hit', 'miss', 'sunk']).toContain(result);

  if (gameController.gamePhase === 'in-progress') {
    expect(gameController.currentPlayer).toBe(initialOpponent);
    expect(gameController.opponent).toBe(initialCurrentPlayer);
  } else {
    expect(gameController.gamePhase).toBe('game-over');
    expect(gameController.winner).toBeDefined();
  }
});

it('should process the computer turn and switch turns if the game is still in progress', () => {
  const gameController = new GameController();
  gameController.setupGame();

  // Ensure it's the computer's turn
  if (gameController.currentPlayer.type !== 'computer') {
    gameController.switchTurns();
  }

  const initialCurrentPlayer = gameController.currentPlayer;
  const initialOpponent = gameController.opponent;

  const result = gameController.processComputerTurn();
  expect(['hit', 'miss', 'sunk', 'already attacked']).toContain(result);

  if (result !== 'already attacked') {
    if (gameController.gamePhase === 'in-progress') {
      expect(gameController.currentPlayer).toBe(initialOpponent);
      expect(gameController.opponent).toBe(initialCurrentPlayer);
    } else {
      expect(gameController.gamePhase).toBe('game-over');
      expect(gameController.winner).toBeDefined();
    }
  } else {
    // If the computer attacked an already attacked position, the turn should not switch
    expect(gameController.currentPlayer).toBe(initialCurrentPlayer);
    expect(gameController.opponent).toBe(initialOpponent);
  }
});

it('should check for game over condition correctly', () => {
  const gameController = new GameController();
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

it('should not declare game over if not all ships are sunk', () => {
  const gameController = new GameController();
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

it('should have receiveAttack method with correct parameters', () => {
  const gameboard = new Gameboard();
  expect(typeof gameboard.receiveAttack).toBe('function');
  expect(gameboard.receiveAttack.length).toBe(2);
});