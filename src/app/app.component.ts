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

  // --- URL DE CONEXIÓN (Corregida la ubicación) ---
  private socketUrl = 'wss://bad-apple-server-thomas-ahdrddfnazf8gqg0.eastus2-01.azurewebsites.net';
  
  private socket!: WebSocket;
  private observer!: IntersectionObserver;

  // --- REFERENCIAS AL HTML ---
  @ViewChild('audioBadApple') audioBadApple!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMambo') audioMambo!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMiku') audioMiku!: ElementRef<HTMLAudioElement>;
  @ViewChild('videoTeto') videoTeto!: ElementRef<HTMLVideoElement>;

  // --- AL INICIAR LA VISTA ---
  ngAfterViewInit() {
    this.connectWebSocket();
    this.setupScrollObserver();
  }

  // --- AL DESTRUIR LA VISTA ---
  ngOnDestroy() {
    if (this.socket) this.socket.close();
    if (this.observer) this.observer.disconnect();
  }

  // --- WEBSOCKET ---
  connectWebSocket() {
    this.socket = new WebSocket(this.socketUrl);
    
    this.socket.onmessage = (e) => {
      this.asciiFrame = e.data;
    };

    this.socket.onclose = () => {
      console.log('⚠️ Reconectando señal visual...');
      setTimeout(() => this.connectWebSocket(), 1000);
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

    // 2. Preparamos los otros audios (play/pause rápido)
    this.warmUp(this.audioMambo);
    this.warmUp(this.audioMiku);

    // 3. Preparamos video Teto
    if (this.videoTeto && this.videoTeto.nativeElement) {
       this.videoTeto.nativeElement.muted = true;
       this.videoTeto.nativeElement.play();
    }
  }

  warmUp(el: ElementRef<HTMLAudioElement>) {
    el.nativeElement.muted = true;
    el.nativeElement.play().then(() => el.nativeElement.pause()).catch(e => console.log(e));
    el.nativeElement.muted = false; 
  }

  // --- OBSERVER DE SCROLL ---
  setupScrollObserver() {
    const options = { threshold: 0.5 }; 

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.systemStarted) {
          this.handleAudioMix(entry.target.id);
        }
      });
    }, options);

    // Esperar un poco a que el DOM renderice
    setTimeout(() => {
      const stages = document.querySelectorAll('.stage');
      if (stages.length > 0) {
        stages.forEach(el => this.observer.observe(el));
      }
    }, 500);
  }

  // --- MEZCLADOR DE AUDIO ---
  handleAudioMix(stageId: string) {
    if (!this.audioBadApple) return;

    const ba = this.audioBadApple.nativeElement;
    const mambo = this.audioMambo.nativeElement;
    const miku = this.audioMiku.nativeElement;
    const teto = this.videoTeto.nativeElement;

    // Pausar memes temporalmente
    mambo.pause();
    miku.pause();
    teto.muted = true;

    switch(stageId) {
      case 'stage0': // PANTALLA PRINCIPAL
        this.fadeInVolume(ba, 1.0); 
        teto.style.opacity = '0';
        break;
      
      case 'stage1': // MAMBO
        ba.volume = 0.3; 
        mambo.currentTime = 0; 
        mambo.volume = 1.0;
        mambo.play();
        teto.style.opacity = '0';
        break;

      case 'stage2': // MIKU
        ba.volume = 0.3; 
        miku.currentTime = 0; 
        miku.volume = 1.0;
        miku.play();
        teto.style.opacity = '0';
        break;
      
      case 'stage3': // TETO
        ba.volume = 0.3;
        teto.style.opacity = '1'; 
        teto.muted = false; 
        teto.play();
        break;
    }
  }

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

  moveTeto() {
    const r = 250; 
    this.tX = (Math.random() * r * 2) - r;
    this.tY = (Math.random() * r * 2) - r;
  }
  
  onScroll(event: Event) {
    // Necesario para el HTML
  } 
}
