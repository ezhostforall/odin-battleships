const Player = require('./player');
const Ship = require('./ship');

it('should create a Player instance', () => {
  const player = new Player('Alice');
  expect(player).toBeInstanceOf(Player);
});