const Player = require('./player');
const Gameboard = require('./gameboard');
const Ship = require('./ship');
const GameController = require('./gameController');

it('should create a GameController instance', () => {
  const gameController = new GameController();
  expect(gameController).toBeInstanceOf(GameController);
});