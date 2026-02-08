import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
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
  systemStarted = false;
  tX = 0; 
  tY = 0; 

  // --- URL (Asegúrate que coincida con tu backend) ---
  private socketUrl = 'wss://bad-apple-server-thomas-ahdrddfnazf8gqg0.eastus2-01.azurewebsites.net/ws';
  
  private socket: WebSocket | undefined;
  private observer: IntersectionObserver | undefined;

  // --- REFERENCIAS ---
  @ViewChild('asciiPre') asciiPre!: ElementRef<HTMLPreElement>; // REFERENCIA DIRECTA AL DOM
  @ViewChild('audioBadApple') audioBadApple!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMambo') audioMambo!: ElementRef<HTMLAudioElement>;
  @ViewChild('audioMiku') audioMiku!: ElementRef<HTMLAudioElement>;
  @ViewChild('videoTeto') videoTeto!: ElementRef<HTMLVideoElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  // Inyectamos NgZone para salirnos del ciclo de detección de cambios de Angular (ESTO QUITA EL LAG)
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.connectWebSocket();
    setTimeout(() => this.setupScrollObserver(), 500);
  }

  ngOnDestroy() {
    if (this.socket) this.socket.close();
    if (this.observer) this.observer.disconnect();
  }

  // --- WEBSOCKET DE ALTO RENDIMIENTO ---
  connectWebSocket() {
    this.socket = new WebSocket(this.socketUrl);
    
    this.socket.onmessage = (e) => {
      // MAGIA NEGRA: Ejecutamos esto FUERA de Angular para que no verifique errores 30 veces por segundo
      this.ngZone.runOutsideAngular(() => {
        if (this.asciiPre && this.asciiPre.nativeElement) {
          this.asciiPre.nativeElement.innerText = e.data;
        }
      });
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connectWebSocket(), 1000);
    };
  }

  startSystem() {
    if (this.systemStarted) return;
    this.systemStarted = true;
    
    const ba = this.audioBadApple.nativeElement;
    ba.volume = 1.0; 
    ba.play().catch(console.error);

    this.warmUp(this.audioMambo);
    this.warmUp(this.audioMiku);

    if (this.videoTeto?.nativeElement) {
       this.videoTeto.nativeElement.muted = true;
       this.videoTeto.nativeElement.play().catch(() => {});
    }
  }

  warmUp(el: ElementRef<HTMLAudioElement>) {
    el.nativeElement.muted = true;
    el.nativeElement.play().then(() => {
        el.nativeElement.pause();
        el.nativeElement.muted = false; 
    }).catch(() => {});
  }

  setupScrollObserver() {
    const options = { root: this.scrollContainer.nativeElement, threshold: 0.5 }; 
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.systemStarted) {
          this.handleAudioMix(entry.target.id);
        }
      });
    }, options);

    document.querySelectorAll('.stage').forEach(el => this.observer?.observe(el));
  }

  handleAudioMix(stageId: string) {
    if (!this.audioBadApple) return;
    const ba = this.audioBadApple.nativeElement;
    const mambo = this.audioMambo.nativeElement;
    const miku = this.audioMiku.nativeElement;
    const teto = this.videoTeto.nativeElement;

    mambo.pause();
    miku.pause();
    teto.style.opacity = '0';
    teto.muted = true;

    switch(stageId) {
      case 'stage0': // PANTALLA PRINCIPAL
        this.fadeInVolume(ba, 1.0); 
        break;
      case 'stage1': // MAMBO
        ba.volume = 0.2; 
        mambo.currentTime = 0; mambo.volume = 1.0; mambo.play();
        break;
      case 'stage2': // MIKU
        ba.volume = 0.2; 
        miku.currentTime = 0; miku.volume = 1.0; miku.play();
        break;
      case 'stage3': // TETO
        ba.volume = 0.2;
        teto.style.opacity = '1'; teto.muted = false; 
        break;
    }
  }

  fadeInVolume(audio: HTMLAudioElement, target: number) {
    if(audio.volume < target) audio.volume = target; 
  }

  moveTeto() {
    const r = 200; 
    this.tX = (Math.random() * r * 2) - r;
    this.tY = (Math.random() * r * 2) - r;
  }
}
