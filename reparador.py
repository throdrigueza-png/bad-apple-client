import os

# --- CÓDIGO TYPESCRIPT ---
ts_code = """import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  frameData: string = 'ESPERANDO SEÑAL DEL NÚCLEO...';
  private socket!: WebSocket;

  ngOnInit() {
    this.connectToCore();
  }

  connectToCore() {
    this.socket = new WebSocket('ws://localhost:8080/ws-binary-stream');

    this.socket.onopen = () => {
      console.log('✅ Conectado al Sistema Central');
      this.frameData = 'CONEXIÓN ESTABLECIDA. SINCRONIZANDO...';
    };

    this.socket.onmessage = (event) => {
      this.frameData = event.data;
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connectToCore(), 3000);
    };
    
    this.socket.onerror = (err) => {
         console.error('Error:', err);
    };
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
"""

# --- CÓDIGO HTML ---
html_code = """<div class="monitor-container">
  <pre class="matrix-screen">{{ frameData }}</pre>
</div>
"""

# --- CÓDIGO SCSS (ESTILOS) ---
scss_code = """.monitor-container {
    background: #000;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.matrix-screen {
    color: #00ff00;
    font-size: 6px;
    line-height: 6px;
    font-weight: bold;
    white-space: pre;
    text-align: center;
    font-family: 'Courier New', Courier, monospace;
}
"""

# Escribir los archivos
with open("src/app/app.component.ts", "w") as f:
    f.write(ts_code)

with open("src/app/app.component.html", "w") as f:
    f.write(html_code)

with open("src/app/app.component.scss", "w") as f:
    f.write(scss_code)

print("✅ ARCHIVOS DE ANGULAR ARREGLADOS CORRECTAMENTE")
