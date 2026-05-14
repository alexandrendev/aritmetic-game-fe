import { Component, inject, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/auth/auth.service';
import * as QRCode from 'qrcode';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lobby-page">

      @if (sessionData()) {

        @if (isHost()) {
          <!-- ── HOST VIEW ── -->
          <div class="lobby-card host-card">
            <header class="card-header">
              <span class="tag"><i class="fas fa-bolt"></i> O Jogo · Host</span>
              <h1>{{ sessionData()?.name }}</h1>
              <p class="difficulty-badge" [innerHTML]="getDifficultyLabel(sessionData()?.difficulty)"></p>
            </header>

            <!-- Room code -->
            <section class="code-section" aria-label="Código da sala">
              <p class="code-label">Código para os alunos entrarem</p>
              <div class="code-display">
                <div class="room-code">{{ sessionData()?.code }}</div>
                @if (qrCode()) {
                  <img [src]="qrCode()" alt="QR Code da sala" class="qr-code" />
                }
              </div>
              <p class="code-hint">Compartilhe o código ou escaneie o QR code</p>
            </section>

            <!-- Game config -->
            <section class="config-section">
              <h2 class="section-title">Configurações da partida</h2>
              <div class="config-grid">
                <div class="config-item">
                  <label for="totalRounds">Número de rodadas</label>
                  <select id="totalRounds" [(ngModel)]="totalRounds" name="totalRounds">
                    <option [ngValue]="5">5 rodadas</option>
                    <option [ngValue]="10">10 rodadas</option>
                    <option [ngValue]="15">15 rodadas</option>
                    <option [ngValue]="20">20 rodadas</option>
                  </select>
                </div>
                <div class="config-item">
                  <label for="responseWindow">Tempo por questão</label>
                  <select id="responseWindow" [(ngModel)]="responseWindowMs" name="responseWindow">
                    <option [ngValue]="15000">15 segundos</option>
                    <option [ngValue]="30000">30 segundos</option>
                    <option [ngValue]="45000">45 segundos</option>
                    <option [ngValue]="60000">60 segundos</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- Participants -->
            <section class="participants-section">
              <h2 class="section-title">Participantes <span class="count">{{ participants().length }}</span></h2>
              @if (participants().length === 0) {
                <p class="empty-state">Aguardando alunos entrarem com o código acima...</p>
              } @else {
                <div class="participants-grid">
                  @for (p of participants(); track p.id) {
                    <div class="participant-chip">{{ p.nickname }}</div>
                  }
                </div>
              }
            </section>

            @if (error()) {
              <p class="error-msg" role="alert">{{ error() }}</p>
            }

            <div class="actions">
              <button
                class="btn btn-start"
                (click)="startGame()"
                [disabled]="participants().length === 0 || loading()"
              >
                <i class="fas fa-play" *ngIf="!loading()" style="margin-right: 0.5rem"></i>
                {{ loading() ? 'Iniciando...' : 'Iniciar Jogo' }}
              </button>
              <button class="btn btn-leave" (click)="leaveRoom()">
                Encerrar Sala
              </button>
            </div>
          </div>

        } @else {
          <!-- ── GUEST VIEW ── -->
          <div class="lobby-card guest-card">
            <header class="card-header">
              <span class="tag"><i class="fas fa-bolt"></i> O Jogo</span>
              <h1>{{ sessionData()?.name }}</h1>
              <p class="difficulty-badge" [innerHTML]="getDifficultyLabel(sessionData()?.difficulty)"></p>
            </header>

            <section class="waiting-section">
              <div class="waiting-icon"><i class="fas fa-hourglass" style="font-size: 3rem; color: #9333ea"></i></div>
              <p class="waiting-text">Aguardando o professor iniciar o jogo...</p>
            </section>

            <section class="participants-section">
              <h2 class="section-title">Na sala agora <span class="count">{{ participants().length }}</span></h2>
              @if (participants().length === 0) {
                <p class="empty-state">Você é o primeiro! Aguardando mais participantes...</p>
              } @else {
                <div class="participants-grid">
                  @for (p of participants(); track p.id) {
                    <div class="participant-chip">{{ p.nickname }} <i class="fas fa-check" style="color: #10b981; margin-left: 0.5rem"></i></div>
                  }
                </div>
              }
            </section>

            <div class="actions">
              <button class="btn btn-leave" (click)="leaveRoom()">
                ← Sair da Sala
              </button>
            </div>
          </div>
        }

      } @else if (loadError()) {
        <div class="lobby-card">
          <p class="error-msg">{{ loadError() }}</p>
          <button class="btn btn-leave" (click)="leaveRoom()"><i class="fas fa-arrow-left"></i> Voltar</button>
        </div>
      } @else {
        <div class="lobby-card">
          <p class="loading-text">Carregando sala...</p>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }

    .lobby-page {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: clamp(1rem, 3vw, 2rem);
    }

    .lobby-card {
      width: min(640px, 100%);
      background: #fff;
      border-radius: 28px;
      padding: clamp(1.4rem, 3vw, 2.2rem);
      box-shadow: 0 20px 60px rgba(109, 40, 217, 0.14);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .host-card { border: 2px solid rgba(167, 139, 250, 0.3); }
    .guest-card { border: 2px solid rgba(249, 115, 22, 0.25); }

    .card-header { display: flex; flex-direction: column; gap: 0.4rem; }

    .tag {
      display: inline-block;
      width: fit-content;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 700;
      color: #4C1D95;
      background: #F5F3FF;
      border: 1.5px solid #DDD6FE;
      padding: 0.28rem 0.65rem;
      border-radius: 999px;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 4vw, 2rem);
      color: #1E1B4B;
      line-height: 1.2;
    }

    .difficulty-badge {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #6D28D9;
    }

    /* Code section */
    .code-section {
      background: #F5F3FF;
      border: 2px solid #DDD6FE;
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      text-align: center;
    }

    .code-label {
      margin: 0 0 0.5rem;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: #6D28D9;
    }

    .room-code {
      font-family: 'Baloo 2', monospace;
      font-size: clamp(2.2rem, 8vw, 3.2rem);
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #7C3AED;
      line-height: 1;
    }

    .code-hint {
      margin: 0.5rem 0 0;
      font-size: 0.85rem;
      color: #8B5CF6;
    }

    .code-display {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .qr-code {
      width: 180px;
      height: 180px;
      border: 3px solid rgba(167, 139, 250, 0.3);
      border-radius: 12px;
      padding: 8px;
      background: #fff;
    .qr-img {
      display: block;
      margin: 1rem auto 0;
      width: 180px;
      height: 180px;
      border-radius: 12px;
    }

    /* Config */
    .section-title {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      color: #1E1B4B;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .count {
      background: #7C3AED;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
    }

    .config-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .config-item label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #4C1D95;
      margin-bottom: 0.35rem;
    }

    .config-item select {
      width: 100%;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      padding: 0.6rem 0.8rem;
      font-size: 0.95rem;
      font-family: inherit;
      color: #1E1B4B;
      background: #fff;
      cursor: pointer;
    }

    .config-item select:focus {
      outline: none;
      border-color: #7C3AED;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
    }

    /* Participants */
    .empty-state {
      margin: 0;
      color: #9CA3AF;
      font-size: 0.9rem;
      font-style: italic;
      text-align: center;
      padding: 0.75rem 0;
    }

    .participants-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .participant-chip {
      background: #F5F3FF;
      border: 1.5px solid #DDD6FE;
      color: #4C1D95;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
    }

    /* Waiting */
    .waiting-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 0;
    }

    .waiting-icon { font-size: 2.5rem; }

    .waiting-text {
      margin: 0;
      color: #6D28D9;
      font-size: 1.05rem;
      font-weight: 600;
      text-align: center;
    }

    /* Actions */
    .actions { display: flex; flex-direction: column; gap: 0.6rem; }

    .btn {
      width: 100%;
      border: 0;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1rem;
      padding: 0.85rem 1rem;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    .btn-start {
      background: linear-gradient(135deg, #7C3AED, #A855F7);
      color: #fff;
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
    }

    .btn-start:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(124, 58, 237, 0.45);
    }

    .btn-start:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-leave {
      background: #F5F3FF;
      color: #6D28D9;
      border: 2px solid #DDD6FE;
    }

    .btn-leave:hover { background: #EDE9FE; }

    .error-msg {
      margin: 0;
      color: #DC2626;
      font-weight: 600;
      font-size: 0.9rem;
      text-align: center;
    }

    .loading-text {
      text-align: center;
      color: #6D28D9;
      padding: 2rem 0;
    }

    @media (max-width: 480px) {
      .config-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  public gameState = inject(GameStateService);
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sessionId = 0;
  sessionData = signal<any>(null);
  qrCode = signal<string | null>(null);
  loading = signal(false);
  loadError = signal<string | null>(null);
  error = signal<string | null>(null);
  qrCodeUrl = signal<string | null>(null);

  totalRounds = 5;
  responseWindowMs = 30000;

  readonly participants = this.gameState.participants;

  constructor() {
    effect(() => {
      const started = this.gameState.session();
      if (started && !this.isHost() && this.sessionId) {
        void this.router.navigate(['/game', this.sessionId]);
      }
    });

    effect(() => {
      const code = this.sessionData()?.code;
      if (code) {
        console.log('Generating QR code for:', code);
        QRCode.toDataURL(code, { width: 200, margin: 1, color: { dark: '#1E1B4B', light: '#FFFFFF' } })
          .then((url) => {
            console.log('QR code generated');
            this.qrCode.set(url);
          })
          .catch((err) => {
            console.error('QR code error:', err);
            this.qrCode.set(null);
          });
      }
    });
  }

  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.sessionId) {
      void this.router.navigate([this.isHost() ? '/dashboard' : '/']);
      return;
    }

    this.gameState.connectToSession(this.sessionId);

    if (this.isHost()) {
      this.gameService.getSessionDetails(this.sessionId).subscribe({
        next: (response) => this.sessionData.set(response),
        error: () => this.loadError.set('Erro ao carregar dados da sala. Tente novamente.'),
      });
    } else {
      const cached = localStorage.getItem('join-session-data');
      if (cached) {
        this.sessionData.set(JSON.parse(cached));
      } else {
        this.loadError.set('Dados da sala não encontrados. Volte e escaneie o código novamente.');
      }
    }
  }

  isHost(): boolean {
    return this.authService.isAuthenticated();
  }

  startGame(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gameService.startSession(this.sessionId, {
      totalRounds: this.totalRounds,
      responseWindowMs: this.responseWindowMs,
    }).subscribe({
      next: () => void this.router.navigate(['/game', this.sessionId]),
      error: () => {
        this.error.set('Erro ao iniciar o jogo. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  leaveRoom(): void {
    localStorage.removeItem('join-session-id');
    localStorage.removeItem('join-session-data');
    localStorage.removeItem('guest-session-id');
    localStorage.removeItem('guest-nickname');
    this.gameState.disconnect(this.sessionId);
    void this.router.navigate([this.isHost() ? '/dashboard' : '/']);
  }

  getDifficultyLabel(difficulty: string | undefined): string {
    const labels: Record<string, string> = {
      easy: '<i class="fas fa-lightbulb" style="color: #10b981; margin-right: 0.4rem;"></i> Fácil',
      medium: '<i class="fas fa-bolt" style="color: #f59e0b; margin-right: 0.4rem;"></i> Médio',
      hard: '<i class="fas fa-fire" style="color: #ef4444; margin-right: 0.4rem;"></i> Difícil',
    };
    return labels[difficulty ?? ''] ?? '';
  }

  ngOnDestroy() {
    this.gameState.disconnect(this.sessionId);
  }
}
