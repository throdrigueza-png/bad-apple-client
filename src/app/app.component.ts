import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  // VARIABLES
  asciiFrame = "INITIATING CONNECTION...";
  systemStarted = false;
  tX = 0; tY = 0; // Teto coords

  // REFERENCIAS DE AUDIO Y VIDEO
  @ViewChild('audioBadApple') audioBadApple!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMambo') audioMambo!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMiku') audioMiku!: ElementRef<HTMLAudioElement>;
  @ViewChild('videoTeto') videoTeto!: ElementRef<HTMLVideoElement>;

  private socket!: WebSocket;
  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    // 1. CONECTAR VISUALES INMEDIATAMENTE (Sin esperar click)
    this.connectWebSocket();
    // 2. PREPARAR SENSOR DE SCROLL
    this.setupScrollObserver();
  }

  ngOnDestroy() {
    if (this.socket) this.socket.close();
    if (this.observer) this.observer.disconnect();
  }

  // --- WEBSOCKET (VISUALES ETERNAS) ---
  connectWebSocket() {
    // Apuntamos al puerto 8081 (Python)
    this.socket = new WebSocket('wss://bad-apple-server-thomas-xxxx.azurewebsites.net');
    
    this.socket.onmessage = (e) => {
      // Recibir frame y actualizar pantalla
      this.asciiFrame = e.data;
    };

    this.socket.onclose = () => {
      // Reconexión agresiva si se cae
      console.log('⚠️ Reconnecting visual feed...');
      setTimeout(() => this.connectWebSocket(), 1000);
    };
  }

  // --- ARRANQUE DEL SISTEMA (AUDIO) ---
  startSystem() {
    this.systemStarted = true;
    
    // 🔥 AQUÍ ESTÁ LA MAGIA: BAD APPLE ARRANCA Y NO PARA 🔥
    const ba = this.audioBadApple.nativeElement;
    ba.volume = 1.0; // Volumen al máximo
    ba.play().catch(e => console.error("Error Bad Apple Audio:", e));

    // "Calentamos" los otros audios (Play y Pause rápido para cargar el buffer)
    this.warmUp(this.audioMambo);
    this.warmUp(this.audioMiku);
  }

  warmUp(el: ElementRef) {
    el.nativeElement.muted = true;
    el.nativeElement.play().then(() => el.nativeElement.pause());
    el.nativeElement.muted = false;
  }

  // --- MEZCLADOR DE AUDIO INTELIGENTE ---
  setupScrollObserver() {
    const options = { threshold: 0.5 }; // Detectar al 50% de visibilidad

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.systemStarted) {
          this.handleAudioMix(entry.target.id);
        }
      });
    }, options);

    // Observar cada sección
    setTimeout(() => {
      document.querySelectorAll('.stage').forEach(el => this.observer.observe(el));
    }, 500);
  }

  handleAudioMix(stageId: string) {
    const ba = this.audioBadApple.nativeElement;
    const mambo = this.audioMambo.nativeElement;
    const miku = this.audioMiku.nativeElement;
    const teto = this.videoTeto.nativeElement;

    // 1. SILENCIAR TEMPORALMENTE LOS MEMES (Para reiniciar o parar)
    mambo.pause();
    miku.pause();
    teto.muted = true; // Teto solo se silencia, sigue moviéndose
    teto.pause();

    // 2. LÓGICA DE MEZCLA (DUCKING)
    switch(stageId) {
      case 'stage0': // PANTALLA PRINCIPAL
        // Bad Apple vuelve a ser el rey
        this.fadeInVolume(ba, 1.0); 
        break;
      
      case 'stage1': // MAMBO
        // Bad Apple baja al 30% (NO PAUSA)
        ba.volume = 0.3; 
        mambo.currentTime = 0;
        mambo.volume = 1.0;
        mambo.play();
        break;

      case 'stage2': // MIKU
        // Bad Apple baja al 30% (NO PAUSA)
        ba.volume = 0.3;
        miku.currentTime = 0;
        miku.volume = 1.0;
        miku.play();
        break;
      
      case 'stage3': // TETO
        // Bad Apple baja al 30% (NO PAUSA)
        ba.volume = 0.3;
        teto.muted = false; // Teto toma el control
        teto.play();
        break;
    }
  }

  // Pequeña utilidad para subir el volumen suavemente
  fadeInVolume(audio: HTMLAudioElement, target: number) {
    let vol = audio.volume;
    const interval = setInterval(() => {
      if (vol < target) {
        vol += 0.1;
        if (vol > 1) vol = 1;
        audio.volume = vol;
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  // --- TETO ESCAPISTA ---
  moveTeto() {
    const r = 250; // Rango de escape
    this.tX = (Math.random() * r * 2) - r;
    this.tY = (Math.random() * r * 2) - r;
  }
  
  onScroll(event: any) {
    // Necesario para el HTML, pero la lógica real va en el Observer
  } 
}