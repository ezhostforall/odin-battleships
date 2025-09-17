const Gameboard = require('./gameboard');

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
  const ship = { length: 3, hits: 0, sunk: false }; // Mock ship object
  const start = [0, 0];
  const end = [0, 2];
  gameboard.placeShip(ship, start, end);
  expect(gameboard.ships).toContain(ship);
  expect(gameboard.board[0][0]).toBe(ship);
  expect(gameboard.board[0][1]).toBe(ship);
  expect(gameboard.board[0][2]).toBe(ship);
});