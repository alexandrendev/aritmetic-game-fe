import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lobby-container">
      <h1>🎮 Sala de Espera</h1>

      @if (sessionData()) {
        <div class="session-info">
          <div class="info-item">
            <strong>Sala:</strong> {{ sessionData()?.name }}
          </div>
          <div class="info-item">
            <strong>Código:</strong> <span class="code">{{ sessionData()?.code }}</span>
          </div>
          <div class="info-item">
            <strong>Dificuldade:</strong> {{ getDifficultyEmoji(sessionData()?.difficulty) }} {{ sessionData()?.difficulty }}
          </div>
        </div>
      }

      <div class="participants-section">
        <h2>👥 Participantes ({{ gameState.participants().length }})</h2>
        
        @if (gameState.participants().length === 0) {
          <p class="empty">Aguardando participantes...</p>
        } @else {
          <div class="participants-list">
            @for (participant of gameState.participants(); track participant.id) {
              <div class="participant-card">
                <div class="participant-name">{{ participant.nickname }}</div>
                <div class="participant-status">Pronto ✓</div>
              </div>
            }
          </div>
        }
      </div>

      <div class="actions">
        @if (isHost()) {
          <button (click)="startGame()" [disabled]="gameState.participants().length === 0 || loading()" class="btn-primary">
            {{ loading() ? 'Iniciando...' : '▶️ Iniciar Jogo' }}
          </button>
        } @else {
          <p class="waiting-text">Aguarde o professor iniciar o jogo...</p>
        }
        
        <button (click)="leaveLobby()" [disabled]="loading()" class="btn-secondary">
          ← Sair
        </button>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .lobby-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
    }

    h2 {
      color: #333;
      margin-bottom: 15px;
    }

    .session-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 30px;
      border-left: 4px solid #0b5d75;
    }

    .info-item {
      margin: 8px 0;
      font-size: 14px;
    }

    .info-item strong {
      color: #333;
    }

    .code {
      font-weight: bold;
      font-size: 18px;
      color: #0b5d75;
      font-family: monospace;
      letter-spacing: 2px;
    }

    .participants-section {
      margin-bottom: 30px;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 20px;
      font-style: italic;
    }

    .participants-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    .participant-card {
      background: #f0f8ff;
      border: 2px solid #0b5d75;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }

    .participant-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
      word-break: break-word;
    }

    .participant-status {
      font-size: 12px;
      color: #0b5d75;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-direction: column;
    }

    .btn-primary, .btn-secondary {
      padding: 12px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-primary {
      background: #0b5d75;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0a4958;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #ddd;
      color: #333;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #ccc;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .waiting-text {
      text-align: center;
      color: #666;
      padding: 15px;
      font-size: 16px;
    }

    .error-message {
      margin-top: 15px;
      padding: 10px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c00;
    }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  public gameState = inject(GameStateService);
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sessionId = 0;
  sessionData = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.sessionId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Conecta ao canal do Pusher para receber updates em tempo real
    this.gameState.connectToSession(this.sessionId);

    // Carrega dados iniciais da sessão
    this.gameService.getSessionDetails(this.sessionId).subscribe({
      next: (response) => {
        this.sessionData.set(response);
      },
      error: (err) => {
        this.error.set('Erro ao carregar dados da sala');
      }
    });
  }

  isHost(): boolean {
    // Host é identificado pelo token de autenticação
    // Guest não tem token, apenas guest-session-id no localStorage
    const token = localStorage.getItem('math-game-access-token');
    return !!token;
  }

  startGame() {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      target: this.gameState.participants().length,
      totalRounds: 5,
      responseWindowMs: 30000
    };

    this.gameService.startSession(this.sessionId, params).subscribe({
      next: () => {
        this.router.navigate(['/game', this.sessionId]);
      },
      error: (err) => {
        this.error.set('Erro ao iniciar o jogo');
        this.loading.set(false);
      }
    });
  }

  leaveLobby() {
    localStorage.removeItem('join-session-id');
    localStorage.removeItem('guest-session-id');
    localStorage.removeItem('guest-nickname');
    this.gameState.disconnect(this.sessionId);
    this.router.navigate(['/dashboard']);
  }

  getDifficultyEmoji(difficulty: string): string {
    const emojiMap: { [key: string]: string } = {
      'easy': '🟢',
      'medium': '🟡',
      'hard': '🔴'
    };
    return emojiMap[difficulty] || '❓';
  }

  ngOnDestroy() {
    this.gameState.disconnect(this.sessionId);
  }
}
