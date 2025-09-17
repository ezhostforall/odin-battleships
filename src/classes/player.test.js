const Player = require('./player');
const Ship = require('./ship');

it('should create a Player instance', () => {
  const player = new Player();
  expect(player).toBeInstanceOf(Player);
});


it('should have default name and type', () => {
  const player = new Player();
  expect(player.name).toBe('Human Player');
  expect(player.type).toBe('human');
});

it('should allow setting custom name and type', () => {
  const player = new Player('AI Bot', 'computer');
  expect(player.name).toBe('AI Bot');
  expect(player.type).toBe('computer');
});

it('should contain its own Gameboard instance', () => {
  const player = new Player();
  expect(player.gameboard).toBeInstanceOf(Gameboard);
});
