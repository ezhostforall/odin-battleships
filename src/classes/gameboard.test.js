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