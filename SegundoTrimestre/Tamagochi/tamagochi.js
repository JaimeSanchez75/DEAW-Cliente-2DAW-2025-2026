class TamagotchiStickman 
{
    constructor(nombre) 
    {
        this.nombre = nombre || "Stickman";
        this.hambre = 100;
        this.felicidad = 100;
        this.energia = 100;
        this.estaVivo = true;
        this.durmiendo = false;
        this.intervalId = null;
        this.logs = [];
        this.canvas = document.getElementById('stickmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 10; // 17x17 celdas de 10px -> 170x170
        this.initCanvas();
    }
    initCanvas() 
    {
        this.canvas.width = 170;
        this.canvas.height = 170;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.font = "bold 16px 'Courier New', monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }
    addLog(mensaje) 
    {
        this.logs.unshift(mensaje);
        if (this.logs.length > 12) this.logs.pop();
        this.actualizarUI();
    }
    // Dibujar cuerpo del stickman (sin cara)
    drawBody() 
    {
        this.ctx.clearRect(0, 0, 170, 170);
        this.ctx.fillStyle = "#e6d5b3";
        this.ctx.fillRect(0, 0, 170, 170);
        
        const pixel = (x, y, color) => 
        {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        };
        const skin = "#f7d9aa";
        const outline = "#5a3e1b";
        // Cabeza (círculo aproximado en grid, centro 8,5)
        for (let dx = -3; dx <= 3; dx++) 
        {
            for (let dy = -3; dy <= 3; dy++) 
            {
                const x = 8 + dx;
                const y = 5 + dy;
                if (dx*dx + dy*dy <= 10) {pixel(x, y, skin); if (Math.abs(dx) === 3 || Math.abs(dy) === 3) pixel(x, y, outline);}
            }
        }
        // Cuerpo
        for (let y = 9; y <= 14; y++) pixel(8, y, outline);
        // Brazos
        for (let y = 10; y <= 11; y++) { pixel(5, y, outline); pixel(11, y, outline); }
        // Piernas
        pixel(7, 15, outline); pixel(9, 15, outline);
        pixel(6, 16, outline); pixel(10, 16, outline);
    }
    // Dibujar la cara según el estado emocional
    drawFace(estado) 
    {
        this.ctx.font = "bold 18px 'Courier New', monospace";
        this.ctx.fillStyle = "#000000";
        this.ctx.shadowBlur = 0;
        let cara = "";
        if (estado === "muerto") {cara = "X_X";} 
        else if (estado === "dormido") {cara = "-_-";} 
        else if (estado === "triste") {cara = ":<";} 
        else if (estado === "feliz") {cara = ":>";} 
        else {cara = ":|";}
        const centerX = 85;
        const centerY = 55;
        this.ctx.fillText(cara, centerX, centerY);
        // Si está durmiendo, añadimos Zzz pequeños
        if (estado === "dormido") 
        {
            this.ctx.font = "12px monospace";
            this.ctx.fillStyle = "#8888ff";
            this.ctx.fillText("z", 105, 40);
            this.ctx.fillText("Z", 115, 30);
        }
    }
    getEstadoDibujo() 
    {
        if (!this.estaVivo) return "muerto";
        if (this.durmiendo) return "dormido";
        if (this.felicidad <= 30) return "triste";
        if (this.felicidad >= 70) return "feliz";
        return "normal";
    }
    actualizarUI() 
    {
        // Actualizar textos y barras
        document.getElementById('petName').innerText = this.nombre;
        document.getElementById('hambreValue').innerText = Math.floor(this.hambre);
        document.getElementById('diversionValue').innerText = Math.floor(this.felicidad);
        document.getElementById('energiaValue').innerText = Math.floor(this.energia);
        const hambreBar = document.getElementById('hambreBar');
        const diversionBar = document.getElementById('diversionBar');
        const energiaBar = document.getElementById('energiaBar');
        hambreBar.style.width = `${this.hambre}%`;
        hambreBar.innerText = `${Math.floor(this.hambre)}%`;
        diversionBar.style.width = `${this.felicidad}%`;
        diversionBar.innerText = `${Math.floor(this.felicidad)}%`;
        energiaBar.style.width = `${this.energia}%`;
        energiaBar.innerText = `${Math.floor(this.energia)}%`;
        // Colores críticos
        hambreBar.className = `progress-bar ${this.hambre <= 20 ? 'bg-dark' : (this.hambre <= 50 ? 'bg-warning' : 'bg-danger')}`;
        diversionBar.className = `progress-bar ${this.felicidad <= 20 ? 'bg-dark' : (this.felicidad <= 50 ? 'bg-warning' : 'bg-success')}`;
        energiaBar.className = `progress-bar ${this.energia <= 20 ? 'bg-dark' : (this.energia <= 50 ? 'bg-warning' : 'bg-info')}`;
        // Dibujar todo
        this.drawBody();
        const estado = this.getEstadoDibujo();
        this.drawFace(estado);
        // Log
        const logContainer = document.getElementById('logList');
        logContainer.innerHTML = '';
        this.logs.slice(0, 12).forEach(msg => 
        {
            const li = document.createElement('li');
            li.innerHTML = `<i class="bi bi-chat-right-text"></i> ${msg}`;
            logContainer.appendChild(li);
        });
        // Botones
        const btnComer = document.getElementById('btnComer');
        const btnJugar = document.getElementById('btnJugar');
        const btnDormir = document.getElementById('btnDormir');
        if (!this.estaVivo) 
        {
            btnComer.disabled = true;
            btnJugar.disabled = true;
            btnDormir.disabled = true;
        } 
        else if (this.durmiendo) 
        {
            btnComer.disabled = true;
            btnJugar.disabled = true;
            btnDormir.disabled = true;
        } 
        else 
        {
            btnComer.disabled = false;
            btnJugar.disabled = false;
            btnDormir.disabled = false;
        }
    }
    modificarStat(stat, incremento) 
    {
        if (!this.estaVivo) return false;
        if (this.durmiendo) 
        {
            this.addLog("🧟ZzZ... ¡No es sonámbulo así que no puede hacer nada durmiendo!.");
            return false;
        }
        let nuevoValor = this[stat] + incremento;
        if (nuevoValor > 100) nuevoValor = 100;
        if (nuevoValor < 0) nuevoValor = 0;
        this[stat] = nuevoValor;
        if (this[stat] <= 0) 
        {
            this.gameOver();
            return false;
        }
        return true;
    }
    comer() 
    {
        if (!this.estaVivo) return;
        const antes = this.hambre;
        if (this.modificarStat('hambre', 15)) 
        {
            this.addLog(`🥗¡Qué rico! ${this.nombre} comió, +15 hambre (${Math.floor(antes)} → ${Math.floor(this.hambre)})`);
            this.actualizarUI();
        }
    }
    jugar() 
    {
        if (!this.estaVivo) return;
        const antes = this.felicidad;
        if (this.modificarStat('felicidad', 12)) 
        {
            this.addLog(`⚽¡Ha estado divertido! ${this.nombre} jugó, +12 felicidad (${Math.floor(antes)} → ${Math.floor(this.felicidad)})`);
            this.actualizarUI();
        }
    }
    dormir() 
    {
        if (!this.estaVivo) return;
        if (this.durmiendo) {this.addLog("Ya está durmiendo...");return;}
        const antes = this.energia;
        if (this.modificarStat('energia', 20)) 
        {
            this.addLog(`🛏️💤${this.nombre} duerme, +20 energía (${Math.floor(antes)} → ${Math.floor(this.energia)}). Zzz...`);
            this.actualizarUI();
            this.durmiendo = true;
            this.actualizarUI();
            setTimeout(() => 
            {
                this.durmiendo = false;
                this.addLog(`🌄¡Buenos días! ${this.nombre} ha despertado.`);
                this.actualizarUI();
            }, 3000);
        }
    }
    iniciarGameLoop() 
    {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => 
        {
            if (!this.estaVivo) return;
            if (this.durmiendo) return;
            let cambios = false;
            if (this.hambre - 2 <= 0) 
            {
                this.hambre = 0;
                this.gameOver();
                return;
            } 
            else {this.hambre = Math.max(0, this.hambre - 2); cambios = true;}
            if (this.felicidad - 1 <= 0) 
            {
                this.felicidad = 0;
                this.gameOver();
                return;
            }
            else {this.felicidad = Math.max(0, this.felicidad - 1); cambios = true;}
            if (this.energia - 1 <= 0) 
            {
                this.energia = 0;
                this.gameOver();
                return;
            } 
            else {this.energia = Math.max(0, this.energia - 1); cambios = true;}
            if (cambios) 
            {
                this.addLog(`🕐Pasa el Tiempo... Hambre -2, Diversión -1, Energía -1`);
                this.actualizarUI();
            }
        }, 3000);
    }
    gameOver() 
    {
        if (!this.estaVivo) return;
        this.estaVivo = false;
        if (this.intervalId) clearInterval(this.intervalId);
        this.addLog(`💀 Se acabó... ${this.nombre} ha muerto...`);
        this.actualizarUI();
        alert(`🪦:,( ${this.nombre} falleció. Recarga la página para empezar de nuevo.`);
    }
}
// Inicialización
document.addEventListener('DOMContentLoaded', () => 
{
    let nombre = prompt("Nombre de tu stickman:", "Señor Palo");
    if (!nombre || nombre.trim() === "") nombre = "Palo Palez";
    const mascota = new TamagotchiStickman(nombre);
    mascota.addLog(`Nuevo amanecer para ${mascota.nombre}. ¡Hola mundo!`);
    mascota.iniciarGameLoop();
    mascota.actualizarUI();
    document.getElementById('btnComer').addEventListener('click', () => mascota.comer());
    document.getElementById('btnJugar').addEventListener('click', () => mascota.jugar());
    document.getElementById('btnDormir').addEventListener('click', () => mascota.dormir());
});