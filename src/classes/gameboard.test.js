import Gameboard from './gameboard.js';
import Ship from './ship.js';

describe('Gameboard', () => {
  let gameboard;
  
  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('should create an empty gameboard', () => {
    expect(gameboard).toBeInstanceOf(Gameboard);
    expect(gameboard.board).toBeDefined();
    expect(gameboard.ships).toEqual([]);
    expect(gameboard.misses).toEqual([]);
    expect(gameboard.attackedPositions).toBeInstanceOf(Set);
  });

  test('should create a 10x10 board', () => {
    expect(gameboard.board.length).toBe(10);
    gameboard.board.forEach(row => {
      expect(row.length).toBe(10);
      expect(row.every(cell => cell === null)).toBe(true);
    });
  });

  test('should place a ship horizontally', () => {
    const ship = new Ship(3, 'Cruiser');
    const result = gameboard.placeShip(ship, 0, 0, true);
    
    expect(result).toBe(true);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
    expect(gameboard.ships).toContain(ship);
  });

  test('should place a ship vertically', () => {
    const ship = new Ship(3, 'Cruiser');
    const result = gameboard.placeShip(ship, 0, 0, false);
    
    expect(result).toBe(true);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[1][0]).toBe(ship);
    expect(gameboard.board[2][0]).toBe(ship);
    expect(gameboard.ships).toContain(ship);
  });

  test('should not allow placing a ship out of bounds horizontally', () => {
    const ship = new Ship(4, 'Battleship');
    const result = gameboard.placeShip(ship, 0, 8, true);
    
    expect(result).toBe(false);
    expect(gameboard.ships).not.toContain(ship);
  });

  test('should not allow placing a ship out of bounds vertically', () => {
    const ship = new Ship(4, 'Battleship');
    const result = gameboard.placeShip(ship, 8, 0, false);
    
    expect(result).toBe(false);
    expect(gameboard.ships).not.toContain(ship);
  });

  test('should not allow placing overlapping ships', () => {
    const ship1 = new Ship(3, 'Cruiser');
    const ship2 = new Ship(2, 'Destroyer');
    
    gameboard.placeShip(ship1, 0, 0, true);
    const result = gameboard.placeShip(ship2, 0, 1, false);
    
    expect(result).toBe(false);
    expect(gameboard.ships).toContain(ship1);
    expect(gameboard.ships).not.toContain(ship2);
  });

  test('should register a hit when attacking a ship', () => {
    const ship = new Ship(2, 'Destroyer');
    gameboard.placeShip(ship, 0, 0, true);
    
    const result = gameboard.receiveAttack(0, 0);
    
    expect(result).toBe('hit');
    expect(ship.hits).toBe(1);
    expect(gameboard.attackedPositions.has('0,0')).toBe(true);
  });

  test('should register a miss when attacking empty water', () => {
    const result = gameboard.receiveAttack(5, 5);
    
    expect(result).toBe('miss');
    expect(gameboard.misses).toContain('5,5');
    expect(gameboard.attackedPositions.has('5,5')).toBe(true);
  });

  test('should return "sunk" when a ship is completely destroyed', () => {
    const ship = new Ship(1, 'Patrol Boat');
    gameboard.placeShip(ship, 0, 0, true);
    
    const result = gameboard.receiveAttack(0, 0);
    
    expect(result).toBe('sunk');
    expect(ship.sunk).toBe(true);
  });

  test('should not allow attacking the same position twice', () => {
    gameboard.receiveAttack(5, 5);
    const result = gameboard.receiveAttack(5, 5);
    
    expect(result).toBe('already attacked');
    expect(gameboard.misses.length).toBe(1);
  });

  test('should track all attacked positions correctly', () => {
    const ship = new Ship(2, 'Destroyer');
    gameboard.placeShip(ship, 0, 0, true);
    
    gameboard.receiveAttack(0, 0); // hit
    gameboard.receiveAttack(1, 1); // miss
    gameboard.receiveAttack(0, 1); // hit and sink
    
    expect(gameboard.attackedPositions.has('0,0')).toBe(true);
    expect(gameboard.attackedPositions.has('1,1')).toBe(true);
    expect(gameboard.attackedPositions.has('0,1')).toBe(true);
    expect(gameboard.attackedPositions.size).toBe(3);
  });

  test('should correctly identify when all ships are sunk', () => {
    const ship1 = new Ship(1, 'Patrol Boat 1');
    const ship2 = new Ship(1, 'Patrol Boat 2');
    
    gameboard.placeShip(ship1, 0, 0, true);
    gameboard.placeShip(ship2, 2, 2, true);
    
    expect(gameboard.allShipsSunk()).toBe(false);
    
    gameboard.receiveAttack(0, 0); // sink ship1
    expect(gameboard.allShipsSunk()).toBe(false);
    
    gameboard.receiveAttack(2, 2); // sink ship2
    expect(gameboard.allShipsSunk()).toBe(true);
  });

  test('should handle multiple ships on the board', () => {
    const ship1 = new Ship(2, 'Destroyer');
    const ship2 = new Ship(3, 'Cruiser');
    
    gameboard.placeShip(ship1, 0, 0, true);
    gameboard.placeShip(ship2, 2, 0, false);
    
    expect(gameboard.ships.length).toBe(2);
    expect(gameboard.ships).toContain(ship1);
    expect(gameboard.ships).toContain(ship2);
  });

  test('should handle complex ship placement scenarios', () => {
    const carrier = new Ship(5, 'Carrier');
    const battleship = new Ship(4, 'Battleship');
    const cruiser = new Ship(3, 'Cruiser');
    const submarine = new Ship(3, 'Submarine');
    const destroyer = new Ship(2, 'Destroyer');
    
    expect(gameboard.placeShip(carrier, 0, 0, true)).toBe(true);
    expect(gameboard.placeShip(battleship, 2, 0, true)).toBe(true);
    expect(gameboard.placeShip(cruiser, 4, 0, true)).toBe(true);
    expect(gameboard.placeShip(submarine, 6, 0, true)).toBe(true);
    expect(gameboard.placeShip(destroyer, 8, 0, true)).toBe(true);
    
    expect(gameboard.ships.length).toBe(5);
  });
});