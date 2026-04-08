// -------------------------- CLASE TABLERO (Grid) --------------------------
class Board 
{
    constructor(rows, cols, containerId) 
    {
        this.rows = rows;
        this.cols = cols;
        this.container = document.getElementById(containerId);
        this.cells = []; // matriz 2D de elementos HTML
        this.initGrid();
    }

    initGrid()  //Inicializa el grid creando los divs correspondientes y almacenándolos en una matriz bidimensional
    {
        this.container.innerHTML = '';
        this.cells = [];
        for (let i = 0; i < this.rows; i++) 
        {
            this.cells[i] = [];
            for (let j = 0; j < this.cols; j++) 
            {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.container.appendChild(cell);
                this.cells[i][j] = cell;
            }
        }
    }
    // Limpia todas las clases especiales (snake, head, food)
    clearAllStyles() {for (let i = 0; i < this.rows; i++) {for (let j = 0; j < this.cols; j++) {this.cells[i][j].classList.remove('snake', 'head', 'food');}}}

    // Dibuja la serpiente y la comida en el grid
    draw(snakePositions, foodPos, headPos) 
    {
        this.clearAllStyles();
        // Dibujar comida
        if (foodPos) {const [fr, fc] = foodPos;if (this.cells[fr] && this.cells[fr][fc]) this.cells[fr][fc].classList.add('food');}
        // Dibujar serpiente (cada parte)
        for (let i = 0; i < snakePositions.length; i++) 
        {
            const [r, c] = snakePositions[i];
            if (this.cells[r] && this.cells[r][c]) {this.cells[r][c].classList.add('snake');if (headPos && r === headPos[0] && c === headPos[1]) {this.cells[r][c].classList.add('head');}}
        }
    }
}
// -------------------------- CLASE SERPIENTE (Lógica) --------------------------
class Snake 
{
    constructor(initialPositions, initialDirection) 
    {
        this.body = [...initialPositions]; // array de [row, col]
        this.direction = initialDirection; // 'RIGHT', 'LEFT', 'UP', 'DOWN'
        this.nextDirection = initialDirection;
    }

    getHead() {return this.body[0];} //Posición de la cabeza (primer elemento del array)

    getBody() {return this.body;} //Devuelve el array completo de posiciones de la serpiente.
    setDirection(newDir) // Cambia la dirección de la serpiente
    {
        // Evitar giro de 180 grados
        if ((this.direction === 'RIGHT' && newDir === 'LEFT') ||(this.direction === 'LEFT' && newDir === 'RIGHT') ||(this.direction === 'UP' && newDir === 'DOWN') ||(this.direction === 'DOWN' && newDir === 'UP')) {return;} 
        this.nextDirection = newDir;
    }
    updateDirection() {this.direction = this.nextDirection;}
    move(grow = false) // Mueve la serpiente en la dirección actual.
    {
        // Actualizar dirección antes de mover
        this.updateDirection();
        let newHead = [...this.getHead()];
        switch (this.direction) 
        {
            case 'RIGHT': newHead[1]++; break;
            case 'LEFT': newHead[1]--; break;
            case 'UP': newHead[0]--; break;
            case 'DOWN': newHead[0]++; break;
        }
    
        this.body.unshift(newHead);// Insertar nueva cabeza al inicio del array para simular movimiento hacia adelante.
        if (!grow) {this.body.pop();} // Si no crece, eliminar la cola para simular el movimiento.
        return newHead;
    }
    checkCollision(rows, cols) // Comprobar colisión consigo misma o límites (rows, cols)
    {
        const head = this.getHead();
        // Límites
        if (head[0] < 0 || head[0] >= rows || head[1] < 0 || head[1] >= cols) return true;
        // Colisión con su propio cuerpo (excepto cabeza)
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i][0] === head[0] && this.body[i][1] === head[1]) return true;
        }
        return false;
    }
    // Para guardado: obtener estado actual
    serialize() {return {body: this.body, direction: this.direction, nextDirection: this.nextDirection};}
    static deserialize(data) 
    {
        const snake = new Snake([[0,0]], 'RIGHT'); // valores temporales, serán sobrescritos
        snake.body = data.body;
        snake.direction = data.direction;
        snake.nextDirection = data.nextDirection;
        return snake;
    }
}
// -------------------------- GESTOR DE PUNTUACIONES (LocalStorage) --------------------------
class ScoreManager 
{
    static STORAGE_KEY = 'snake_scores';
    static getScores() // Obtener array de puntuaciones desde localStorage (o vacío si no hay).
    {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    }
    static addScore(playerName, points) 
    {
        if (!playerName || playerName.trim() === '') playerName = 'Anónimo';
        const scores = this.getScores();
        scores.push
        ({
            name: playerName.trim(),
            points: points,
            date: new Date().toLocaleString()
        });
        // Ordenar descendente y mantener solo top 10
        scores.sort((a, b) => b.points - a.points);
        const topScores = scores.slice(0, 10);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
    }
    static renderScoresTable() 
    {
        const tbody = document.getElementById('scoresTableBody');
        if (!tbody) return;
        const scores = this.getScores();
        if (scores.length === 0) {tbody.innerHTML = '<tr><td colspan="4" class="text-center">Sin puntuaciones aún</td></tr>'; return;}
        tbody.innerHTML = '';
        scores.forEach((score, idx) => 
        {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = idx + 1;
            row.insertCell(1).innerText = score.name;
            row.insertCell(2).innerText = score.points;
            row.insertCell(3).innerText = score.date;
        });
    }
}
// -------------------------- GESTOR DE PARTIDA GUARDADA (LocalStorage) --------------------------
class SaveManager 
{
    static SAVE_KEY = 'snake_current_game'; // Clave para guardar estado actual de la partida.
    static saveGame(gameState) {localStorage.setItem(this.SAVE_KEY, JSON.stringify(gameState));} // Guardar estado completo de la partida (serpiente, comida, puntos, tiempo, jugador)
    static loadGame() 
    {
        const saved = localStorage.getItem(this.SAVE_KEY);
        if (!saved) return null;
        return JSON.parse(saved);
    }
    static clearSave() {localStorage.removeItem(this.SAVE_KEY);}
}
// -------------------------- CLASE PRINCIPAL DEL JUEGO --------------------------
class SnakeGame // Controla la lógica general del juego, interacción entre tablero, serpiente, comida, puntuación y temporizador.
{
    constructor(rows = 20, cols = 20) // Inicializa el juego con dimensiones del tablero y estado inicial.
    {
        this.rows = rows;
        this.cols = cols;
        this.board = new Board(rows, cols, 'snakeGrid');
        this.snake = null;
        this.food = null;
        this.score = 0;
        this.gameLoopInterval = null;
        this.timerInterval = null;
        this.startTime = null; // timestamp absoluto de inicio (ms)
        this.elapsedTime = 0;  // segundos acumulados (para guardado)
        this.isRunning = false;
        this.currentPlayer = null; // nombre jugador actual
        this.isCountdown = false;   // para respetar los 3 segundos al continuar
        this.pendingStart = false;
    }

    
    generateRandomFood() // Generar nueva comida en posición aleatoria no ocupada por la serpiente
    {
        const totalCells = this.rows * this.cols;
        if (this.snake.body.length >= totalCells) return null; // Victoria (serpiente llena)
        const snakeSet = new Set(this.snake.body.map(seg => `${seg[0]},${seg[1]}`));
        let freeCells = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!snakeSet.has(`${i},${j}`)) freeCells.push([i, j]);
            }
        }
        if (freeCells.length === 0) return null;
        const rand = Math.floor(Math.random() * freeCells.length);
        return freeCells[rand];
    }
    updateTimerDisplay() // Actualizar tiempo
    {
        const timerSpan = document.getElementById('timerValue');
        if (timerSpan) timerSpan.innerText = this.elapsedTime;
    }
    updateScoreDisplay() // Actualizar puntuación 
    {
        const scoreSpan = document.getElementById('scoreValue');
        if (scoreSpan) scoreSpan.innerText = this.score;
    }
    updatePlayerDisplay() // Actualizar nombre del jugador
    {
        const playerSpan = document.getElementById('playerNameDisplay');
        if (playerSpan) playerSpan.innerText = this.currentPlayer || '---';
    }
    startTimer() // Iniciar reloj (debe llamarse al comenzar partida o reanudar)
    {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.startTime = Date.now() - (this.elapsedTime * 1000);
        this.timerInterval = setInterval(() => 
        {
            if (!this.isRunning || this.isCountdown) return;
            const now = Date.now();
            this.elapsedTime = Math.floor((now - this.startTime) / 1000);
            this.updateTimerDisplay();
            this.autoSave();// Guardado automático cada 5 segundos (opcional, también guardamos en cada movimiento)
        }, 1000);
    }
    // Guardar estado completo (incluyendo tiempo, puntos, serpiente, comida)
    autoSave() 
    {
        if (!this.isRunning || this.isCountdown) return;
        const gameState = 
        {
            snake: this.snake.serialize(),
            food: this.food,
            score: this.score,
            elapsedTime: this.elapsedTime,
            playerName: this.currentPlayer,
            timestamp: Date.now()
        };
        SaveManager.saveGame(gameState);
    }
    stopGame(clearSave = false) // Detener juego (limpiar intervalos)
    {
        this.isRunning = false;
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.gameLoopInterval = null;
        this.timerInterval = null;
        if (clearSave) SaveManager.clearSave();
    }
    gameOver() // Game Over, cuando pierdes
    {
        if (!this.isRunning) return;
        this.stopGame(true);
        // Guardar puntuación en ranking
        if (this.currentPlayer && this.currentPlayer !== '---') 
        {
            ScoreManager.addScore(this.currentPlayer, this.score);
            ScoreManager.renderScoresTable();
        }
        // Mostrar mensaje con Bootstrap toast o alert (usamos alert amigable)
        alert(`🐍 GAME OVER 🐍\nPuntuación: ${this.score}\nTiempo: ${this.elapsedTime} segundos\nSe ha guardado tu puntuación.`);
        this.currentPlayer = null;
        this.updatePlayerDisplay();
        this.board.clearAllStyles();
    }
    
    step() // Movimiento principal de la serpiente (llamado por intervalo)
    {
        if (!this.isRunning || this.isCountdown) return;
        // Intentar mover la serpiente (inicialmente sin crecer)
        let grow = false;
        const head = this.snake.getHead();
        if (this.food && head[0] === this.food[0] && head[1] === this.food[1])
        {
            grow = true;
            this.score++;
            this.updateScoreDisplay();
            // Generar nueva comida
            const newFood = this.generateRandomFood();
            if (!newFood) 
            {
                alert(`¡INCREÍBLE! Has llenado el tablero. Puntuación final: ${this.score}`);
                this.gameOver();
                return;
            }
            this.food = newFood;
        }
        this.snake.move(grow);
        // Comprobar colisiones después del movimiento
        if (this.snake.checkCollision(this.rows, this.cols)) 
        {
            this.gameOver();
            return;
        }
        // Actualizar grid 
        this.board.draw(this.snake.getBody(), this.food, this.snake.getHead());
        // Guardado automático después de cada movimiento 
        if (this.isRunning) this.autoSave();
    }
    // Iniciar bucle del juego (movimiento cada 150ms)
    startGameLoop() {if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);this.gameLoopInterval = setInterval(() => this.step(), 150);}
    // Inicializar nueva partida con nombre de jugador
    initNewGame(playerName) 
    {
        this.stopGame(true);
        this.currentPlayer = playerName || "Anónimo";
        this.score = 0;
        this.elapsedTime = 0;
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updatePlayerDisplay();
        // Serpiente inicial: centro del tablero, longitud 3
        const centerRow = Math.floor(this.rows / 2);
        const centerCol = Math.floor(this.cols / 2);
        const initialSnake = 
        [
            [centerRow, centerCol],
            [centerRow, centerCol - 1],
            [centerRow, centerCol - 2]
        ];
        this.snake = new Snake(initialSnake, 'RIGHT');
        // Generar primera comida que no esté en la serpiente
        this.food = this.generateRandomFood();
        if (!this.food) {this.food = [centerRow - 1, centerCol];}// Si no hay espacio 
        this.board.draw(this.snake.getBody(), this.food, this.snake.getHead());
        this.isRunning = true;
        this.isCountdown = false;
        this.startTimer();
        this.startGameLoop();
        this.autoSave(); // guardado inicial
    }
    async continueGame() // Continuar partida guardada (con cuenta atrás de 3 segundos)
    {
        const saved = SaveManager.loadGame();
        if (!saved) 
        {
            alert("No hay ninguna partida guardada. Inicia una nueva.");
            return false;
        }
        // Detener cualquier juego actual
        this.stopGame(false);
        // Cargar estado guardado
        this.snake = Snake.deserialize(saved.snake);
        this.food = saved.food;
        this.score = saved.score;
        this.elapsedTime = saved.elapsedTime;
        this.currentPlayer = saved.playerName;
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updatePlayerDisplay();
        this.board.draw(this.snake.getBody(), this.food, this.snake.getHead());
        // Mostrar cuenta atrás
        this.isCountdown = true;
        this.isRunning = false; // aún no corre el movimiento
        // Mostrar overlay o mensaje en el centro (usamos un div flotante o sweet? usamos un modal simple)
        const countdownDiv = document.createElement('div');
        countdownDiv.className = 'position-fixed top-50 start-50 translate-middle bg-dark bg-opacity-75 text-warning p-4 rounded-4 text-center z-3';
        countdownDiv.style.zIndex = '2000';
        countdownDiv.innerHTML = `<div class="countdown">3</div><div>Prepárate...</div>`;
        document.body.appendChild(countdownDiv);
        for (let i = 3; i >= 1; i--) {countdownDiv.querySelector('.countdown').innerText = i; await new Promise(r => setTimeout(r, 1000));}
        countdownDiv.remove();
        // Reanudar juego
        this.isCountdown = false;
        this.isRunning = true;
        this.startTimer();   // reanuda el tiempo desde elapsedTime
        this.startGameLoop();
        this.autoSave();     // guardar estado reanudado
        return true;
    }
    
    setupKeyboardControls() // Configurar eventos de teclado (delegación de eventos)
    {
        window.addEventListener('keydown', (e) => 
        {
            if (!this.isRunning || this.isCountdown) return;
            const key = e.key;
            e.preventDefault();
            switch (key) 
            {
                case 'ArrowUp': this.snake.setDirection('UP'); break;
                case 'ArrowDown': this.snake.setDirection('DOWN'); break;
                case 'ArrowLeft': this.snake.setDirection('LEFT'); break;
                case 'ArrowRight': this.snake.setDirection('RIGHT'); break;
                default: break;
            }
        });
    }
}
// -------------------------- INICIALIZACIÓN Y MANEJO DE EVENTOS UI --------------------------
document.addEventListener('DOMContentLoaded', () => 
{
    const game = new SnakeGame(20, 20);
    game.setupKeyboardControls();
    // Modal nueva partida 
    const confirmNewBtn = document.getElementById('confirmNewGame');
    const playerNameInput = document.getElementById('playerNameInput');
    const newGameModalEl = document.getElementById('newGameModal');
    const newGameModal = new bootstrap.Modal(newGameModalEl);
    confirmNewBtn.addEventListener('click', () => 
    {
        let playerName = playerNameInput.value.trim();
        if (playerName === "") playerName = "Jugador";
        game.initNewGame(playerName);
        newGameModal.hide();
        playerNameInput.value = "";
    });
    // Botón continuar partida
    const continueBtn = document.getElementById('continueBtn');
    continueBtn.addEventListener('click', async () => 
    {
        // Si hay partida actual corriendo, preguntar si desea sobreescribir 
        if (game.isRunning) {
            if (confirm("Hay una partida en curso. ¿Deseas abandonarla y cargar la partida guardada?")) {
                game.stopGame(false);
                await game.continueGame();
            }
        } 
        else 
        {
            await game.continueGame();
        }
    });
    // Botón tabla puntuaciones - actualizar cada vez que se abre modal
    const scoresModalEl = document.getElementById('scoresModal');
    scoresModalEl.addEventListener('show.bs.modal', () => {ScoreManager.renderScoresTable();});

    // Al cerrar página o recargar, guardar estado actual (importante)
    window.addEventListener('beforeunload', () => {if (game.isRunning && !game.isCountdown) {game.autoSave();}});

    // Mostrar la tabla de puntuaciones inicial al cargar (por si alguien la abre)
    ScoreManager.renderScoresTable();
    // Mostrar mensaje de bienvenida
    console.log("Snake Game ready - Usa flechas del teclado");
});