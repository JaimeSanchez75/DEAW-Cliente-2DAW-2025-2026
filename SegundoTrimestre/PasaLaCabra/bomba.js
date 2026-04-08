const PREGUNTAS_JSON = 
[
    { titulo: "¿Cuál es la capital de Francia?", opciones: ["Madrid", "París", "Berlín", "Lisboa"], respuestaCorrecta: "París" },
    { titulo: "¿Qué lenguaje se ejecuta en el navegador?", opciones: ["Python", "Java", "JavaScript", "C++"], respuestaCorrecta: "JavaScript" },
    { titulo: "¿Quién pintó la Mona Lisa?", opciones: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], respuestaCorrecta: "Da Vinci" },
    { titulo: "¿Cuál es el planeta más grande?", opciones: ["Marte", "Saturno", "Júpiter", "Neptuno"], respuestaCorrecta: "Júpiter" },
    { titulo: "¿En qué año llegó el hombre a la Luna?", opciones: ["1965", "1969", "1972", "1959"], respuestaCorrecta: "1969" }
];
class TriviaBomb 
{
    constructor(preguntas, tiempoInicialSeg = 30) 
    {
        this.preguntas = preguntas;
        this.tiempoInicial = tiempoInicialSeg;
        this.tiempoRestante = tiempoInicialSeg;
        this.indiceActual = 0;
        this.puntuacion = 0;
        this.juegoActivo = true;
        this.haGanado = false;
        this.timerId = null;
        this.recordLocal = this.cargarRecord();
        this.quizContainer = document.getElementById('quizContainer');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.bestTimeSpan = document.getElementById('bestTimeSpan');
        this.canvas = document.getElementById('bombCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mostrarRecord();
        this.chispaAnimFrame = null;
        this.chispaX = 0;
        this.chispaY = 0;
        this.chispaParpadeo = 0;
    }
    cargarRecord() {const record = localStorage.getItem('triviaBestTime'); return record ? parseInt(record) : 0;}
    guardarRecord(tiempoRestante) 
    {
        if (tiempoRestante > this.recordLocal) 
        {
            this.recordLocal = tiempoRestante;
            localStorage.setItem('triviaBestTime', this.recordLocal);
            this.mostrarRecord();
        }
    }
    mostrarRecord() 
    {
        const minutos = Math.floor(this.recordLocal / 60);
        const segs = this.recordLocal % 60;
        this.bestTimeSpan.innerText = `${minutos.toString().padStart(2,'0')}:${segs.toString().padStart(2,'0')}`;
    }
     dibujarBomba() 
     {
        const w = 200, h = 200;
        this.ctx.clearRect(0, 0, w, h);
        //Variables de posición y tamaño de la bomba
        const cx = 100;
        const cy = 122;
        const radio = 70;
        // Sombreado
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = "#004466";
        // Cuerpo de bomba 
        const grad = this.ctx.createRadialGradient(cx-20, cy-20, 10, cx, cy, radio);
        grad.addColorStop(0, '#2c5a7a');
        grad.addColorStop(0.6, '#0a2a3a');
        grad.addColorStop(1, '#041520');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radio, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        // Borde 
        this.ctx.strokeStyle = '#3a8cbf';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        // Accesorios (tornillos)
        this.ctx.fillStyle = '#1a4a6e';
        for (let ang = 0; ang < 360; ang += 45) 
        {
            let rad = ang * Math.PI/180;
            let x = cx + 48 * Math.cos(rad);
            let y = cy + 48 * Math.sin(rad);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.fillStyle = '#6aafdf';
            this.ctx.beginPath();
            this.ctx.arc(x-1, y-1, 2, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.fillStyle = '#1a4a6e';
        }
        // Calavera
        this.ctx.font = "bold 34px monospace";
        this.ctx.fillStyle = "#b8e2ff";
        this.ctx.fillText("☠", cx-20, cy+10);
        // ========== MECHA ==========
        const startX = cx;
        const startY = cy - radio + 5;  
        const maxLargo = 48; 
        const tiempoPorc = Math.max(0, this.tiempoRestante / this.tiempoInicial);
        const largoActual = maxLargo * tiempoPorc;
        const endY = startY - largoActual;
        const endX = startX + (Math.sin(Date.now() / 300) * 2);
        // Dibujar mecha
        this.ctx.beginPath();
        this.ctx.moveTo(startX - 5, startY);
        this.ctx.lineTo(startX + 5, startY);
        this.ctx.lineTo(endX + 4, endY);
        this.ctx.lineTo(endX - 4, endY);
        this.ctx.fillStyle = '#b8c8d8';
        this.ctx.fill();
        this.ctx.fillStyle = '#5a6e7e';
        this.ctx.beginPath();
        this.ctx.moveTo(startX - 2, startY);
        this.ctx.lineTo(startX + 2, startY);
        this.ctx.lineTo(endX + 1, endY);
        this.ctx.lineTo(endX - 1, endY);
        this.ctx.fill();
        // Detalles 
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#3a4a55';
        this.ctx.lineWidth = 1.5;
        const steps = Math.min(6, Math.floor(largoActual / 6));
        for (let i = 1; i <= steps; i++) 
        {
            let t = i / steps;
            let y = startY - (largoActual * t);
            if (y > endY && y < startY) 
            {
                let xOff = Math.sin(t * Math.PI) * 5;
                this.ctx.beginPath();
                this.ctx.moveTo(startX - xOff, y);
                this.ctx.lineTo(startX + xOff, y);
                this.ctx.stroke();
            }
        }
        // Guardar posición de la punta para la chispa
        this.chispaX = endX;
        this.chispaY = endY;
        // ========== CHISPA ==========
        if (this.juegoActivo && this.tiempoRestante > 0 && !this.haGanado && largoActual > 3) 
        {
            this.chispaParpadeo = (this.chispaParpadeo + 0.4) % (Math.PI * 2);
            const intensidad = 0.6 + Math.sin(this.chispaParpadeo * 6) * 0.4;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#00aaff';
            // Llama azul
            this.ctx.fillStyle = `rgba(80, 180, 255, ${intensidad})`;
            this.ctx.beginPath();
            this.ctx.arc(this.chispaX, this.chispaY, 6 + Math.sin(this.chispaParpadeo * 8) * 2, 0, Math.PI*2);
            this.ctx.fill();
            // Núcleo blanco
            this.ctx.fillStyle = `rgba(255, 255, 200, ${intensidad + 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(this.chispaX - 1, this.chispaY - 1, 3, 0, Math.PI*2);
            this.ctx.fill();
            // Chispas alrededor
            for (let i = 0; i < 3; i++) 
            {
                let angle = this.chispaParpadeo * 5 + i * 2;
                let dx = Math.sin(angle) * 4;
                let dy = Math.cos(angle) * 4 - 2;
                this.ctx.fillStyle = `rgba(200, 220, 255, ${intensidad * 0.7})`;
                this.ctx.beginPath();
                this.ctx.arc(this.chispaX + dx, this.chispaY + dy, 2, 0, Math.PI*2);
                this.ctx.fill();
            }
            this.ctx.shadowBlur = 0;
        } 
        else if (largoActual <= 3 && this.tiempoRestante > 0 && this.juegoActivo) 
        {
            //Chispa chica
            this.ctx.fillStyle = '#ffaa44';
            this.ctx.beginPath();
            this.ctx.arc(this.chispaX, this.chispaY, 3, 0, Math.PI*2);
            this.ctx.fill();
        }
    }
    iniciarAnimacionCanvas() 
    {
        const animar = () => 
        {
            this.dibujarBomba();
            this.chispaAnimFrame = requestAnimationFrame(animar);
        };
        if (this.chispaAnimFrame) cancelAnimationFrame(this.chispaAnimFrame);
        this.chispaAnimFrame = requestAnimationFrame(animar);
    }
    actualizarTemporizadorVisual() 
    {
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        const texto = `${minutos.toString().padStart(2,'0')}:${segundos.toString().padStart(2,'0')}`;
        this.timerDisplay.innerText = texto;
        if (!this.juegoActivo && this.haGanado) 
        {
            this.timerDisplay.style.color = "#aaffdd";
            this.timerDisplay.style.textShadow = "0 0 5px #00ccaa";
        } 
        else if (this.tiempoRestante <= 5 && this.juegoActivo) 
        {
            this.timerDisplay.style.color = "#ff6666";
            this.timerDisplay.style.animation = "blink 0.5s step-end infinite";
        } 
        else 
        {
            this.timerDisplay.style.color = "#88ccff";
            this.timerDisplay.style.animation = "none";
        }
    }
    iniciarTemporizador() 
    {
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = setInterval(() => 
        {
            if (!this.juegoActivo) return;
            if (this.tiempoRestante <= 1) 
            {
                this.tiempoRestante = 0;
                this.actualizarTemporizadorVisual();
                this.explotar();
            } 
            else 
            {
                this.tiempoRestante--;
                this.actualizarTemporizadorVisual();
                this.dibujarBomba();
            }
        }, 1000);
    }
    explotar() 
    {
        if (!this.juegoActivo) return;
        this.juegoActivo = false;
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = null;
        this.ctx.clearRect(0,0,200,200);
        this.ctx.fillStyle = "#4488ff";
        this.ctx.beginPath();
        this.ctx.arc(100,100,90,0,Math.PI*2);
        this.ctx.fill();
        this.ctx.fillStyle = "#aaddff";
        this.ctx.font = "bold 30px monospace";
        this.ctx.fillText("💥", 70, 115);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("BOOM!", 55, 160);
        
        this.quizContainer.innerHTML = `<div class="alert bomb-card text-white">💀 GAME OVER 💀<br><button id="restartAfterLose" class="btn btn-info mt-2">Reintentar</button></div>`;
        const restartBtn = document.getElementById('restartAfterLose');
        if (restartBtn) restartBtn.onclick = () => this.reiniciar();
    }
    victoria() 
    {
        if (!this.juegoActivo) return;
        this.juegoActivo = false;
        this.haGanado = true;
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = null;
        this.guardarRecord(this.tiempoRestante);
        this.actualizarTemporizadorVisual();
        this.dibujarBomba(); // sin chispa
        this.quizContainer.innerHTML = `
            <div class="alert bomb-card text-white text-center">
                <h2>🎉 ¡BOMBA DESACTIVADA! 🎉</h2>
                <p>¡Nos has salvado, genial!</p>
                <p>Tiempo restante: ${this.timerDisplay.innerText}</p>
                <button id="playAgainWin" class="btn btn-info">Jugar de nuevo</button>
            </div>
        `;
        const againBtn = document.getElementById('playAgainWin');
        if (againBtn) againBtn.onclick = () => this.reiniciar();
    }
    barajarOpciones(opciones) 
    {
        const copia = [...opciones];
        for (let i = copia.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }
    renderizarPregunta() 
    {
        if (!this.juegoActivo) return;
        if (this.indiceActual >= this.preguntas.length) {this.victoria(); return;}
        const pregunta = this.preguntas[this.indiceActual];
        const opcionesBarajadas = this.barajarOpciones(pregunta.opciones);
        let html = `<h3 class="text-light mb-3">${pregunta.titulo}</h3><div class="d-flex flex-column gap-2">`;
        opcionesBarajadas.forEach(op => {html += `<button class="btn btn-option btn-lg w-100 opcion-btn" data-opcion="${op}">${op}</button>`;});
        html += `</div><div class="mt-3 text-info">Pregunta ${this.indiceActual+1} de ${this.preguntas.length}</div>`;
        this.quizContainer.innerHTML = html;
        document.querySelectorAll('.opcion-btn').forEach(btn => {btn.addEventListener('click', (e) => this.manejarRespuesta(btn.dataset.opcion, btn));});
    }
    manejarRespuesta(opcionSeleccionada, btnElement) 
    {
        if (!this.juegoActivo) return;
        const preguntaActual = this.preguntas[this.indiceActual];
        const esCorrecta = (opcionSeleccionada === preguntaActual.respuestaCorrecta);
        if (esCorrecta) 
        {
            btnElement.classList.add('correct-feedback');
            this.puntuacion++;
            setTimeout(() => 
            {
                if (!this.juegoActivo) return;
                this.indiceActual++;
                if (this.indiceActual < this.preguntas.length) {this.renderizarPregunta();} 
                else {this.victoria();}
            }, 400);
        } 
        else 
        {
            btnElement.classList.add('wrong-feedback');
            this.tiempoRestante = Math.max(0, this.tiempoRestante - 5);
            this.actualizarTemporizadorVisual();
            this.dibujarBomba();
            if (this.tiempoRestante <= 0) {this.explotar(); return;}
            setTimeout(() => 
            {
                if (!this.juegoActivo) return;
                document.querySelectorAll('.opcion-btn').forEach(btn => {btn.classList.remove('correct-feedback', 'wrong-feedback');});
            }, 400);
            const btns = document.querySelectorAll('.opcion-btn');
            btns.forEach(b => b.disabled = true);
            setTimeout(() => {if (this.juegoActivo) btns.forEach(b => b.disabled = false);}, 500);
        }
    }
    reiniciar() 
    {
        if (this.timerId) clearInterval(this.timerId);
        if (this.chispaAnimFrame) cancelAnimationFrame(this.chispaAnimFrame);
        this.juegoActivo = true;
        this.haGanado = false;
        this.indiceActual = 0;
        this.puntuacion = 0;
        this.tiempoRestante = this.tiempoInicial;
        this.actualizarTemporizadorVisual();
        this.iniciarAnimacionCanvas();
        this.iniciarTemporizador();
        this.renderizarPregunta();
    }
    iniciar() 
    {
        this.juegoActivo = true;
        this.haGanado = false;
        this.indiceActual = 0;
        this.tiempoRestante = this.tiempoInicial;
        this.actualizarTemporizadorVisual();
        this.iniciarAnimacionCanvas();
        this.iniciarTemporizador();
        this.renderizarPregunta();
    }
}
document.addEventListener('DOMContentLoaded', () => 
{
    const game = new TriviaBomb(PREGUNTAS_JSON, 30);
    game.iniciar();
    document.getElementById('resetGameBtn').addEventListener('click', () => {if (confirm("¿Reiniciar partida?")) game.reiniciar();});
});