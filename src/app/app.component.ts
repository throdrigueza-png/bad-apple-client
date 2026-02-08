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
  // --- VARIABLES ---
  asciiFrame = "INITIATING CONNECTION...";
  systemStarted = false;
  tX = 0; 
  tY = 0; 

  // --- URL DE CONEXIÓN CORREGIDA ---
  // IMPORTANTE: Le agregué el '/ws' al final, es OBLIGATORIO.
  private socketUrl = 'wss://bad-apple-server-thomas-ahdrddfnazf8gqg0.eastus2-01.azurewebsites.net/ws';
  
  private socket: WebSocket | undefined;
  private observer: IntersectionObserver | undefined;

  // --- REFERENCIAS AL HTML ---
  @ViewChild('audioBadApple') audioBadApple!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMambo') audioMambo!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMiku') audioMiku!: ElementRef<HTMLAudioElement>;
  @ViewChild('videoTeto') videoTeto!: ElementRef<HTMLVideoElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  // --- AL INICIAR LA VISTA ---
  ngAfterViewInit() {
    this.connectWebSocket();
    // Esperamos un poco para asegurar que el DOM esté listo para el Observer
    setTimeout(() => this.setupScrollObserver(), 500);
  }

  // --- AL DESTRUIR LA VISTA ---
  ngOnDestroy() {
    if (this.socket) this.socket.close();
    if (this.observer) this.observer.disconnect();
  }

  // --- WEBSOCKET ---
  connectWebSocket() {
    console.log("Intentando conectar a:", this.socketUrl);
    this.socket = new WebSocket(this.socketUrl);
    
    this.socket.onopen = () => {
      console.log("✅ CONEXIÓN ESTABLECIDA CON AZURE");
    };

    this.socket.onmessage = (e) => {
      this.asciiFrame = e.data;
    };

    this.socket.onclose = () => {
      console.log('⚠️ Conexión perdida. Reconectando señal visual...');
      setTimeout(() => this.connectWebSocket(), 2000);
    };

    this.socket.onerror = (err) => {
      console.error("Error WS:", err);
    };
  }

  // --- ARRANQUE DEL SISTEMA (Click inicial) ---
  startSystem() {
    if (this.systemStarted) return;
    this.systemStarted = true;
    
    // 1. Bad Apple arranca
    const ba = this.audioBadApple.nativeElement;
    ba.volume = 1.0; 
    ba.play().catch(e => console.error("Error Bad Apple Audio:", e));

    // 2. Preparamos los otros audios (play/pause rápido para desbloquearlos)
    this.warmUp(this.audioMambo);
    this.warmUp(this.audioMiku);

    // 3. Preparamos video Teto
    if (this.videoTeto && this.videoTeto.nativeElement) {
       this.videoTeto.nativeElement.muted = true; // Video debe estar muteado para autoplay
       this.videoTeto.nativeElement.play().catch(e => console.log("Teto espera su turno"));
    }
  }

  warmUp(el: ElementRef<HTMLAudioElement>) {
    el.nativeElement.muted = true;
    el.nativeElement.play().then(() => {
        el.nativeElement.pause();
        el.nativeElement.muted = false; 
    }).catch(e => console.log("Warmup error:", e));
  }

  // --- OBSERVER DE SCROLL ---
  setupScrollObserver() {
    const options = { 
      root: this.scrollContainer.nativeElement, // Observamos dentro del main
      threshold: 0.5 // Se activa cuando el 50% de la sección es visible
    }; 

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.systemStarted) {
          console.log("Entrando a escena:", entry.target.id);
          this.handleAudioMix(entry.target.id);
        }
      });
    }, options);

    const stages = document.querySelectorAll('.stage');
    stages.forEach(el => this.observer?.observe(el));
  }

  // --- MEZCLADOR DE AUDIO ---
  handleAudioMix(stageId: string) {
    if (!this.audioBadApple) return;

    const ba = this.audioBadApple.nativeElement;
    const mambo = this.audioMambo.nativeElement;
    const miku = this.audioMiku.nativeElement;
    const teto = this.videoTeto.nativeElement;

    // Estado base: Pausar memes, Bad Apple de fondo
    mambo.pause();
    miku.pause();
    // No pausamos Teto video, solo lo ocultamos o muteamos
    teto.style.opacity = '0';
    teto.muted = true;

    switch(stageId) {
      case 'stage0': // PANTALLA PRINCIPAL
        this.fadeInVolume(ba, 1.0); 
        break;
      
      case 'stage1': // MAMBO
        ba.volume = 0.2; 
        mambo.currentTime = 0; 
        mambo.volume = 1.0;
        mambo.play();
        break;

      case 'stage2': // MIKU
        ba.volume = 0.2; 
        miku.currentTime = 0; 
        miku.volume = 1.0;
        miku.play();
        break;
      
      case 'stage3': // TETO
        ba.volume = 0.2;
        teto.style.opacity = '1'; 
        teto.muted = false; 
        break;
    }
  }

  fadeInVolume(audio: HTMLAudioElement, target: number) {
    // Cancelamos cualquier fade anterior si es necesario (simple logic)
    const interval = setInterval(() => {
      if (audio.volume < target) {
        audio.volume = Math.min(audio.volume + 0.1, 1);
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  moveTeto() {
    const r = 200; 
    this.tX = (Math.random() * r * 2) - r;
    this.tY = (Math.random() * r * 2) - r;
  }
}
