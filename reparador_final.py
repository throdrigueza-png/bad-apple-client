import os

# Definimos el contenido TODO EN UNO (Lógica + Vista)
ts_content = """import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  // 🔴 AQUI ESTA EL TRUCO: HTML INCRUSTADO
  template: `
    <div class="monitor-container">
      <pre class="matrix-screen">{{ frameData }}</pre>
    </div>
  `,
  // 🔴 ESTILOS INCRUSTADOS TAMBIEN
  styles: [`
    .monitor-container {
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
        font-size: 8px;
        line-height: 8px;
        font-weight: bold;
        white-space: pre;
        text-align: center;
        font-family: 'Courier New', Courier, monospace;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  frameData: string = '⚠️ SI VES ESTO, YA FUNCIONA. ESPERANDO DATOS...';
  private socket!: WebSocket;

  ngOnInit() {
    this.connectToCore();
  }

  connectToCore() {
    this.socket = new WebSocket('ws://localhost:8080/ws-binary-stream');

    this.socket.onopen = () => {
      console.log('✅ Conectado al Sistema Central');
      this.frameData = 'CONEXIÓN ESTABLECIDA. RECIBIENDO...';
    };

    this.socket.onmessage = (event) => {
      this.frameData = event.data;
    };

    this.socket.onclose = () => {
      console.warn('⚠️ Desconectado. Reintentando...');
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

# Sobrescribimos el archivo TS
with open("src/app/app.component.ts", "w") as f:
    f.write(ts_content)

print("✅ CODIGO INCRUSTADO. AHORA NO PUEDE FALLAR.")
