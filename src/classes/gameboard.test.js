const Gameboard = require('./gameboard');
const Ship = require('./ship');

// Mock the Ship class
jest.mock('./ship', () => {
  return jest.fn().mockImplementation((length) => {
    return {
      length: length,
      hit: jest.fn(),
      sunk: false
    };
  });
});

it('should create an empty gameboard', () => {
  const gameboard = new Gameboard();
  expect(gameboard).toBeInstanceOf(Gameboard);
});

it('should create a 10x10 board', () => {
  const gameboard = new Gameboard();
  expect(gameboard.board.length).toBe(10);
  gameboard.board.forEach(row => {
    expect(row.length).toBe(10);
  });
});

it('should initialize ships and misses arrays', () => {
  const gameboard = new Gameboard();
  expect(gameboard.ships).toEqual([]);
  expect(gameboard.misses).toEqual([]);
});

it('should place a ship on the board', () => {
  const gameboard = new Gameboard();
  const ship = new Ship(3);
  const result = gameboard.placeShip(ship, 0, 0, true);
  expect(result).toBe(true);
  expect(gameboard.board[0][0]).toBe(ship);
  expect(gameboard.board[0][1]).toBe(ship);
  expect(gameboard.board[0][2]).toBe(ship);
  expect(gameboard.ships).toContain(ship);
});

it('should place a ship vertically', () => {
  const gameboard = new Gameboard();
  const ship = new Ship(3);
  gameboard.placeShip(ship, 0, 0, false);
  expect(gameboard.board[0][0]).toBe(ship);
  expect(gameboard.board[1][0]).toBe(ship);
  expect(gameboard.board[2][0]).toBe(ship);
});

it('should have a receiveAttack method', () => {
  const gameboard = new Gameboard();
  expect(typeof gameboard.receiveAttack).toBe('function');
});

it('should have a receiveAttack method that takes coordinates', () => {
  const gameboard = new Gameboard();
  expect(gameboard.receiveAttack.length).toBe(2);
});

it('should register a hit when a ship is at the attacked coordinate', () => {
  const gameboard = new Gameboard();
  const ship = new Ship(2);
  gameboard.placeShip(ship, 0, 0, true);
  const result = gameboard.receiveAttack(0, 0);
  expect(result).toBe('hit');
  expect(ship.hit).toHaveBeenCalled();
});

it('should register a miss when no ship is at the attacked coordinate', () => {
  const gameboard = new Gameboard();
  const result = gameboard.receiveAttack(5, 5);
  expect(result).toBe('miss');
  expect(gameboard.misses).toContainEqual('5,5');
});

it('should not register an attack on the same coordinate twice', () => {
  const gameboard = new Gameboard();
  gameboard.receiveAttack(5, 5);
  const result = gameboard.receiveAttack(5, 5);
  expect(result).toBe('already attacked');
  expect(gameboard.misses.length).toBe(1);
});

it('should return "sunk" when a ship is sunk after attack', () => {
  const gameboard = new Gameboard();
  const ship = new Ship(1);
  ship.sunk = true;
  gameboard.placeShip(ship, 0, 0, true);
  const result = gameboard.receiveAttack(0, 0);
  expect(result).toBe('sunk');
});

it('should track attacked positions', () => {
  const gameboard = new Gameboard();
  gameboard.receiveAttack(3, 4);
  expect(gameboard.attackedPositions.has('3,4')).toBe(true);
});

it('should handle multiple ships on the board', () => {
  const gameboard = new Gameboard();
  const ship1 = new Ship(2);
  const ship2 = new Ship(3);
  gameboard.placeShip(ship1, 0, 0, true);
  gameboard.placeShip(ship2, 2, 0, false);
  expect(gameboard.ships.length).toBe(2);
  expect(gameboard.ships).toContain(ship1);
  expect(gameboard.ships).toContain(ship2);
});

it('should handle attacks on different ships', () => {
  const gameboard = new Gameboard();
  const ship1 = new Ship(2);
  const ship2 = new Ship(2);
  gameboard.placeShip(ship1, 0, 0, true);
  gameboard.placeShip(ship2, 2, 0, true);
  
  const result1 = gameboard.receiveAttack(0, 0);
  const result2 = gameboard.receiveAttack(2, 0);
  
  expect(result1).toBe('hit');
  expect(result2).toBe('hit');
  expect(ship1.hit).toHaveBeenCalled();
  expect(ship2.hit).toHaveBeenCalled();
});

it('should not allow placing a ship out of bounds', () => {
  const gameboard = new Gameboard();
  const ship = new Ship(4);
  const result = gameboard.placeShip(ship, 0, 8, true); // This should be out of bounds
  expect(result).toBe(false);
  expect(gameboard.ships).not.toContain(ship);
});

it('should not allow placing a ship overlapping another ship', () => {
  const gameboard = new Gameboard();
  const ship1 = new Ship(3);
  const ship2 = new Ship(2);
  gameboard.placeShip(ship1, 0, 0, true);
  const result = gameboard.placeShip(ship2, 0, 1, false); // This should overlap
  expect(result).toBe(false);
  expect(gameboard.ships).not.toContain(ship2);
});

it('should correctly identify when all ships are sunk', () => {
  const gameboard = new Gameboard();
  const ship1 = new Ship(1);
  const ship2 = new Ship(1);
  ship1.sunk = true;
  ship2.sunk = true;
  gameboard.placeShip(ship1, 0, 0, true);
  gameboard.placeShip(ship2, 1, 0, true);
  
  const allSunk = gameboard.ships.every(ship => ship.sunk);
  expect(allSunk).toBe(true);
});

it('should not register a hit on an already sunk ship', () => {
  const gameboard = new Gameboard();
  const ship = new Ship(1);
  ship.sunk = true;
  gameboard.placeShip(ship, 0, 0, true);
  
  const result = gameboard.receiveAttack(0, 0);
  expect(result).toBe('already attacked');
});