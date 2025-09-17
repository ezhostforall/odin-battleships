const Ship = require('./ship');

it('should create a ship with a given length', () => {
  const ship = new Ship(5);
  expect(ship.length).toBe(5);
  expect(ship.hits).toBe(0);
  expect(ship.sunk).toBe(false);
});

it('should have a hit function that increments hit count', () => {
  const ship = new Ship(3);
  ship.hit();
  expect(ship.hits).toBe(1);
  ship.hit();
  expect(ship.hits).toBe(2);
});

