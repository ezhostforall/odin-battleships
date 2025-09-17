class Ship {
  constructor(length, name = 'Ship') {
    this.length = length;
    this.name = name;
    this.hits = 0;
    this.sunk = false;
  }

  hit() {
    if (!this.sunk) {
      this.hits++;
      if (this.hits >= this.length) {
        this.sunk = true;
      }
    }
  }

  isSunk() {
    return this.sunk;
  }
}

module.exports = Ship;