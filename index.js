// Import game classes
import Ship from './classes/ship.js';
import Gameboard from './classes/gameboard.js';
import Player from './classes/player.js';
import GameController from './classes/gameController.js';

class BattleshipUI {
    constructor() {
        this.gameController = null;
        this.currentShipIndex = 0;
        this.isHorizontal = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
        this.showSetupScreen();
    }

    setupEventListeners() {
        // Setup screen events
        document.getElementById('random-placement').addEventListener('click', () => this.randomPlacement());
        document.getElementById('clear-ships').addEventListener('click', () => this.clearShips());
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // Orientation change
        document.querySelectorAll('input[name="orientation"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.isHorizontal = e.target.value === 'horizontal';
            });
        });

        // Ship selection
        document.querySelectorAll('.place-ship-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shipItem = e.target.closest('.ship-item');
                this.selectShip(parseInt(shipItem.dataset.shipIndex));
            });
        });

        // Game over screen
        document.getElementById('new-game').addEventListener('click', () => {
            this.newGame();
            this.showSetupScreen();
        });
        
        // Surrender button
        document.getElementById('surrender').addEventListener('click', () => this.surrender());
    }

    showSetupScreen() {
        document.getElementById('setup-screen').style.display = 'block';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        
        this.createPlacementBoard();
    }

    createPlacementBoard() {
        const board = document.getElementById('placement-board');
        board.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.placementClick(row, col));
                cell.addEventListener('mouseenter', () => this.showPlacementPreview(row, col));
                cell.addEventListener('mouseleave', () => this.hidePlacementPreview());
                
                board.appendChild(cell);
            }
        }
    }

    createGameBoard(boardId, clickable = false) {
        const board = document.getElementById(boardId);
        board.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (clickable) {
                    cell.addEventListener('click', () => this.attackClick(row, col));
                }
                
                board.appendChild(cell);
            }
        }
    }

    selectShip(shipIndex) {
        // Clear previous selection
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select new ship
        const shipItem = document.querySelector(`[data-ship-index="${shipIndex}"]`);
        if (shipItem && !shipItem.classList.contains('placed')) {
            shipItem.classList.add('selected');
            this.currentShipIndex = shipIndex;
        }
    }

    placementClick(row, col) {
        if (!this.gameController) return;
        
        const result = this.gameController.placePlayerShip(this.currentShipIndex, row, col, this.isHorizontal);
        
        if (result.success) {
            this.updatePlacementBoard();
            this.markShipAsPlaced(this.currentShipIndex);
            
            if (result.allShipsPlaced) {
                document.getElementById('start-game').disabled = false;
                this.showMessage('All ships placed! Click "Start Game" to begin.');
            } else {
                // Auto-select next ship
                this.selectNextShip();
            }
            
            this.showMessage(result.message);
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    markShipAsPlaced(shipIndex) {
        const shipItem = document.querySelector(`[data-ship-index="${shipIndex}"]`);
        shipItem.classList.add('placed');
        shipItem.classList.remove('selected');
        
        const btn = shipItem.querySelector('.place-ship-btn');
        btn.disabled = true;
        btn.textContent = 'Placed';
    }

    selectNextShip() {
        for (let i = 0; i < 5; i++) {
            const shipItem = document.querySelector(`[data-ship-index="${i}"]`);
            if (!shipItem.classList.contains('placed')) {
                this.selectShip(i);
                break;
            }
        }
    }

    showPlacementPreview(row, col) {
        this.hidePlacementPreview();
        
        if (!this.gameController) return;
        
        const shipType = this.gameController.shipTypes[this.currentShipIndex];
        if (!shipType) return;
        
        const length = shipType.length;
        const cells = [];
        let valid = true;
        
        // Check if placement is valid
        for (let i = 0; i < length; i++) {
            const r = this.isHorizontal ? row : row + i;
            const c = this.isHorizontal ? col + i : col;
            
            if (r >= 10 || c >= 10) {
                valid = false;
                break;
            }
            
            const cell = document.querySelector(`#placement-board [data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                cells.push(cell);
                if (cell.classList.contains('ship')) {
                    valid = false;
                }
            }
        }
        
        // Apply preview styling
        cells.forEach(cell => {
            cell.classList.add(valid ? 'preview' : 'invalid');
        });
    }

    hidePlacementPreview() {
        document.querySelectorAll('#placement-board .board-cell').forEach(cell => {
            cell.classList.remove('preview', 'invalid');
        });
    }

    updatePlacementBoard() {
        if (!this.gameController) return;
        
        const gameState = this.gameController.getGameState();
        const board = gameState.player1.board;
        
        document.querySelectorAll('#placement-board .board-cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellData = board[row][col];
            
            cell.className = 'board-cell';
            if (cellData.ship) {
                cell.classList.add('ship');
            }
        });
    }

    randomPlacement() {
        if (!this.gameController) return;
        
        const result = this.gameController.quickSetup();
        if (result.success) {
            this.updatePlacementBoard();
            
            // Mark all ships as placed
            for (let i = 0; i < 5; i++) {
                this.markShipAsPlaced(i);
            }
            
            document.getElementById('start-game').disabled = false;
            this.showMessage(result.message);
        }
    }

    clearShips() {
        this.newGame();
        this.showMessage('All ships cleared. Place them again.');
    }

    startGame() {
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        
        this.createGameBoard('player-board', false);
        this.createGameBoard('enemy-board', true);
        
        this.updateGameBoard();
        this.updateGameInfo();
    }

    attackClick(row, col) {
        if (!this.gameController || this.gameController.currentPlayer.type !== 'human') return;
        
        const result = this.gameController.processAttack(row, col);
        
        if (result.success) {
            this.updateGameBoard();
            this.updateGameInfo();
            this.showMessage(result.message);
            
            if (this.gameController.gamePhase === 'game-over') {
                this.showGameOver();
            } else if (this.gameController.currentPlayer.type === 'computer') {
                // Process computer turn after a short delay
                setTimeout(() => this.processComputerTurn(), 1000);
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    processComputerTurn() {
        if (!this.gameController || this.gameController.currentPlayer.type !== 'computer') return;
        
        document.getElementById('current-player').textContent = 'Computer thinking...';
        document.getElementById('current-player').classList.add('computer-thinking');
        
        setTimeout(() => {
            const result = this.gameController.processComputerTurn();
            
            if (result.success) {
                this.updateGameBoard();
                this.updateGameInfo();
                this.showMessage(result.message);
                
                if (this.gameController.gamePhase === 'game-over') {
                    this.showGameOver();
                }
            }
            
            document.getElementById('current-player').classList.remove('computer-thinking');
        }, 1500);
    }

    updateGameBoard() {
        if (!this.gameController) return;
        
        const gameState = this.gameController.getGameState();
        
        // Update player board
        this.updateBoardDisplay('player-board', gameState.player1.board);
        
        // Update enemy board
        this.updateBoardDisplay('enemy-board', gameState.player2.board);
    }

    updateBoardDisplay(boardId, boardData) {
        document.querySelectorAll(`#${boardId} .board-cell`).forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellData = boardData[row][col];
            
            cell.className = 'board-cell';
            
            if (cellData.state === 'ship') {
                cell.classList.add('ship');
            } else if (cellData.state === 'hit') {
                cell.classList.add('hit');
            } else if (cellData.state === 'miss') {
                cell.classList.add('miss');
            } else if (cellData.state === 'sunk') {
                cell.classList.add('sunk');
            }
        });
    }

    updateGameInfo() {
        if (!this.gameController) return;
        
        const gameState = this.gameController.getGameState();
        
        document.getElementById('current-player').textContent = 
            gameState.currentPlayerType === 'human' ? 'Your Turn' : 'Computer\'s Turn';
        
        document.getElementById('player-ships').textContent = 
            `Your Ships: ${gameState.player1.shipsRemaining}`;
        
        document.getElementById('enemy-ships').textContent = 
            `Enemy Ships: ${gameState.player2.shipsRemaining}`;
        
        if (gameState.currentPlayerType === 'human') {
            document.getElementById('game-status').textContent = 'Click on the enemy board to attack!';
        } else {
            document.getElementById('game-status').textContent = 'Computer is thinking...';
        }
    }

    showGameOver() {
        const gameState = this.gameController.getGameState();
        
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'block';
        
        const winnerMessage = gameState.winner === 'You' ? 'You Won!' : 'Computer Won!';
        document.getElementById('winner-message').textContent = winnerMessage;
        
        // Show some stats
        const totalTurns = this.gameController.gameHistory.length;
        const playerHits = this.gameController.gameHistory.filter(h => h.player === 'You' && (h.result === 'hit' || h.result === 'sunk')).length;
        const playerAttacks = this.gameController.gameHistory.filter(h => h.player === 'You').length;
        const accuracy = playerAttacks > 0 ? Math.round((playerHits / playerAttacks) * 100) : 0;
        
        document.getElementById('total-turns').textContent = `Total turns: ${totalTurns}`;
        document.getElementById('accuracy').textContent = `Your accuracy: ${accuracy}%`;
    }

    surrender() {
        if (this.gameController && this.gameController.gamePhase === 'in-progress') {
            this.gameController.gamePhase = 'game-over';
            this.gameController.winner = this.gameController.player2;
            this.showGameOver();
        }
    }

    newGame() {
        this.gameController = new GameController();
        this.gameController.startNewGame();
        
        this.currentShipIndex = 0;
        
        // Reset UI
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('placed', 'selected');
            const btn = item.querySelector('.place-ship-btn');
            btn.disabled = false;
            btn.textContent = 'Place';
        });
        
        // Select first ship
        this.selectShip(0);
        
        document.getElementById('start-game').disabled = true;
        
        if (document.getElementById('placement-board').children.length > 0) {
            this.updatePlacementBoard();
        }
    }

    showMessage(message, type = 'info') {
        // Simple message display - you could enhance this with a proper toast system
        const status = document.getElementById('game-status');
        if (status) {
            const originalText = status.textContent;
            status.textContent = message;
            status.style.color = type === 'error' ? '#ff4444' : '#4CAF50';
            
            setTimeout(() => {
                status.textContent = originalText;
                status.style.color = '';
            }, 3000);
        } else {
            // Fallback for setup screen
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BattleshipUI();
});
