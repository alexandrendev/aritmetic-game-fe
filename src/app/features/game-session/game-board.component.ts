import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  template: `
    <div class="game-wrap">

      @if (isHost()) {
        <!-- ═══════════════ HOST OVERVIEW ═══════════════ -->
        <div class="board-card host-board">

          <header class="board-header">
            <span class="tag">⚡ O Jogo · Host</span>
            <div class="round-badge">
              Rodada <strong>{{ gameState.round() }}</strong>
              @if (totalRounds()) { <span class="of">de {{ totalRounds() }}</span> }
            </div>
          </header>

          @if (gameState.isGameOver()) {

            <!-- ── RANKING FINAL ── -->
            <section class="section">
              <h2 class="section-title">🏆 Resultado Final</h2>
              <ng-container *ngTemplateOutlet="podiumTpl; context: { $implicit: gameState.ranking(), isGuest: false }"></ng-container>
            </section>

            <button class="btn btn-leave" (click)="backToDashboard()">← Voltar ao Dashboard</button>

          } @else {

            <!-- ── QUESTÃO ATUAL ── -->
            @if (gameState.currentQuestion(); as q) {
              <section class="section current-question">
                <p class="q-label">Questão desta rodada</p>
                <div class="operation">{{ q.operation }}</div>
                <p class="answer-hint">Resposta: <strong>{{ q.correctAnswer }}</strong></p>
              </section>
            } @else {
              <section class="section waiting-section">
                <p class="waiting-text">⏳ Aguardando próxima rodada...</p>
              </section>
            }

            <!-- ── PARTICIPANTES ── -->
            <section class="section">
              <h2 class="section-title">
                Participantes
                <span class="count">{{ gameState.participants().length }}</span>
              </h2>
              <div class="participant-table">
                @for (p of gameState.participants(); track p.id) {
                  <div class="participant-row" [class.eliminated]="!p.isAlive">
                    <span class="p-name">{{ p.nickname }}</span>
                    <span class="p-lives">{{ p.isAlive ? ('❤️'.repeat(p.lives)) : '💀' }}</span>
                    <span class="p-score">{{ p.score }} pts</span>
                  </div>
                }
              </div>
            </section>

            <button class="btn btn-danger" (click)="finishGame()">⏹ Encerrar Jogo</button>
          }
        </div>

      } @else {
        <!-- ═══════════════ GUEST GAME BOARD ═══════════════ -->
        <div class="board-card guest-board">

          @if (currentPlayer(); as player) {
            <div class="player-hud">
              <span class="hud-nick">👤 {{ player.nickname }}</span>
              <span class="hud-lives">{{ player.isAlive ? ('❤️'.repeat(player.lives)) : '💀 Eliminado' }}</span>
              <span class="hud-score">{{ player.score }} pts</span>
            </div>
          }

          @if (gameState.isGameOver()) {

            <section class="section">
              <h2 class="section-title">🏆 Fim de Jogo!</h2>
              <ng-container *ngTemplateOutlet="podiumTpl; context: { $implicit: gameState.ranking(), isGuest: true }"></ng-container>
            </section>

            <button class="btn btn-leave" (click)="backToHome()">← Voltar ao início</button>

          } @else if (currentPlayer() && !currentPlayer()!.isAlive) {

            <section class="eliminated-section">
              <p class="elim-icon">💀</p>
              <p class="elim-text">Você foi eliminado!</p>
              <p class="elim-sub">Aguarde o fim do jogo para ver o resultado.</p>
            </section>

          } @else if (gameState.currentQuestion(); as question) {

            <div class="question-card">
              <p class="round-label">Rodada {{ gameState.round() }}</p>
              <div class="operation">{{ question.operation }}</div>

              <div class="options-grid">
                @for (option of question.options; track option) {
                  <button
                    class="option-btn"
                    (click)="submitAnswer(option)"
                    [disabled]="answered()"
                    [class.answered]="answered()">
                    {{ option }}
                  </button>
                }
              </div>

              @if (answered()) {
                <p class="answered-msg">✅ Resposta enviada! Aguardando os outros...</p>
              }
            </div>

          } @else {
            <div class="waiting-section">
              <p class="waiting-text">⏳ Aguardando próxima rodada...</p>
            </div>
          }

        </div>
      }

    </div>

    <!-- ═══ PÓDIO TEMPLATE ═══ -->
    <ng-template #podiumTpl let-ranking let-isGuest="isGuest">
      @if (ranking.length >= 2) {
        <div class="podium">
          <!-- 2º lugar (esquerda) -->
          <div class="podium-slot pos-2">
            <div class="podium-nick">{{ ranking[1]?.nickname }}</div>
            <div class="podium-avatar silver">🥈</div>
            <div class="podium-block block-2">
              <span class="podium-pos">2º</span>
              <span class="podium-pts">{{ ranking[1]?.score }} pts</span>
            </div>
          </div>
          <!-- 1º lugar (centro) -->
          <div class="podium-slot pos-1">
            <div class="podium-nick is-winner">{{ ranking[0]?.nickname }}</div>
            <div class="podium-avatar gold">🥇</div>
            <div class="podium-block block-1">
              <span class="podium-pos">1º</span>
              <span class="podium-pts">{{ ranking[0]?.score }} pts</span>
            </div>
          </div>
          <!-- 3º lugar (direita, só se existir) -->
          @if (ranking.length >= 3) {
            <div class="podium-slot pos-3">
              <div class="podium-nick">{{ ranking[2]?.nickname }}</div>
              <div class="podium-avatar bronze">🥉</div>
              <div class="podium-block block-3">
                <span class="podium-pos">3º</span>
                <span class="podium-pts">{{ ranking[2]?.score }} pts</span>
              </div>
            </div>
          }
        </div>
      }

      @if (ranking.length > 3) {
        <ol class="ranking-list">
          @for (p of ranking.slice(3); track p.id) {
            <li class="ranking-item" [class.is-me]="isGuest && p.id === sessionGuestId">
              <span class="pos">{{ p.position }}º</span>
              <span class="name">{{ p.nickname }}</span>
              <span class="pts">{{ p.score }} pts</span>
            </li>
          }
        </ol>
      }

      @if (ranking.length === 1) {
        <div class="solo-winner">
          <p class="solo-crown">👑</p>
          <p class="solo-name">{{ ranking[0]?.nickname }}</p>
          <p class="solo-pts">{{ ranking[0]?.score }} pts</p>
        </div>
      }
    </ng-template>
  `,
  styles: [`
    :host { display: block; }

    .game-wrap {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: clamp(1rem, 3vw, 2rem);
    }

    .board-card {
      width: min(680px, 100%);
      background: #fff;
      border-radius: 28px;
      padding: clamp(1.4rem, 3vw, 2.2rem);
      box-shadow: 0 20px 60px rgba(109, 40, 217, 0.14);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .host-board { border: 2px solid rgba(167, 139, 250, 0.3); }
    .guest-board { border: 2px solid rgba(249, 115, 22, 0.25); }

    /* Header */
    .board-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
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

    .round-badge {
      font-size: 1rem;
      font-weight: 700;
      color: #1E1B4B;
    }

    .round-badge .of {
      font-weight: 400;
      color: #6D28D9;
      margin-left: 0.25rem;
    }

    /* Section */
    .section { display: flex; flex-direction: column; gap: 0.75rem; }

    .section-title {
      margin: 0;
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

    /* Current question (host) */
    .current-question {
      background: #F5F3FF;
      border: 2px solid #DDD6FE;
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      text-align: center;
    }

    .q-label {
      margin: 0 0 0.4rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: #6D28D9;
    }

    .operation {
      font-family: 'Baloo 2', monospace;
      font-size: clamp(2.4rem, 9vw, 3.6rem);
      font-weight: 800;
      color: #7C3AED;
      line-height: 1;
    }

    .answer-hint {
      margin: 0.5rem 0 0;
      font-size: 0.9rem;
      color: #6D28D9;
    }

    /* Participants table (host) */
    .participant-table {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .participant-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.9rem;
      background: #F9FAFB;
      border-radius: 12px;
      border: 1.5px solid #E5E7EB;
    }

    .participant-row.eliminated {
      opacity: 0.5;
      text-decoration: line-through;
    }

    .p-name { flex: 1; font-weight: 700; color: #1E1B4B; }
    .p-lives { font-size: 0.95rem; }
    .p-score { font-weight: 700; color: #7C3AED; }

    /* Player HUD (guest) */
    .player-hud {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #F5F3FF;
      border: 1.5px solid #DDD6FE;
      border-radius: 16px;
      padding: 0.75rem 1rem;
      flex-wrap: wrap;
    }

    .hud-nick { flex: 1; font-weight: 700; color: #1E1B4B; }
    .hud-lives { font-size: 1rem; }
    .hud-score { font-weight: 800; color: #7C3AED; }

    /* Question card (guest) */
    .question-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .round-label {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6D28D9;
    }

    /* Options */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
    }

    .option-btn {
      border: 0;
      border-radius: 16px;
      padding: 1.1rem 0.5rem;
      font-size: 1.6rem;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      background: linear-gradient(135deg, #7C3AED, #A855F7);
      color: #fff;
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.3);
      transition: transform 0.12s, box-shadow 0.12s;
    }

    .option-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(124, 58, 237, 0.4);
    }

    .option-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .option-btn.answered { opacity: 0.6; }

    .answered-msg {
      margin: 0;
      font-weight: 600;
      color: #059669;
      font-size: 0.95rem;
    }

    /* Waiting / Eliminated */
    .waiting-section {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }

    .waiting-text {
      margin: 0;
      color: #6D28D9;
      font-size: 1.05rem;
      font-weight: 600;
    }

    .eliminated-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem 0;
      text-align: center;
    }

    .elim-icon { font-size: 3rem; margin: 0; }
    .elim-text { margin: 0; font-size: 1.3rem; font-weight: 800; color: #DC2626; }
    .elim-sub { margin: 0; color: #6B7280; font-size: 0.9rem; }

    /* Ranking */
    .ranking-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #F9FAFB;
      border-radius: 14px;
      border: 1.5px solid #E5E7EB;
      font-weight: 600;
    }

    .ranking-item.is-me { background: #F5F3FF; border-color: #DDD6FE; }

    .pos { font-weight: 800; color: #7C3AED; min-width: 2rem; }
    .name { flex: 1; color: #1E1B4B; }
    .pts { color: #6D28D9; font-weight: 800; }

    /* Buttons */
    .btn {
      width: 100%;
      border: 0;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1rem;
      padding: 0.85rem 1rem;
      cursor: pointer;
      font-family: inherit;
      transition: transform 0.15s;
    }

    .btn-danger {
      background: #FEF2F2;
      color: #DC2626;
      border: 2px solid #FECACA;
    }

    .btn-danger:hover { background: #FEE2E2; }

    .btn-leave {
      background: #F5F3FF;
      color: #6D28D9;
      border: 2px solid #DDD6FE;
    }

    .btn-leave:hover { background: #EDE9FE; }

    @media (max-width: 480px) {
      .options-grid { grid-template-columns: 1fr; }
      .podium { gap: 0.4rem; }
    }

    /* ── Podium ── */
    .podium {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 0.6rem;
      padding: 0.5rem 0 0;
    }

    .podium-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 120px;
    }

    .podium-nick {
      font-size: 0.8rem;
      font-weight: 700;
      color: #1E1B4B;
      text-align: center;
      margin-bottom: 0.3rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .podium-nick.is-winner {
      font-size: 0.9rem;
      color: #7C3AED;
    }

    .podium-avatar {
      font-size: 2rem;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .podium-block {
      width: 100%;
      border-radius: 14px 14px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 0.6rem 0.4rem;
      gap: 0.2rem;
    }

    .block-1 { height: 100px; background: linear-gradient(180deg, #F5D020, #F6B01A); }
    .block-2 { height: 76px;  background: linear-gradient(180deg, #D1D5DB, #9CA3AF); }
    .block-3 { height: 58px;  background: linear-gradient(180deg, #D97706, #B45309); }

    .podium-pos {
      font-weight: 800;
      font-size: 1.1rem;
      color: rgba(0,0,0,0.6);
    }

    .podium-pts {
      font-size: 0.72rem;
      font-weight: 700;
      color: rgba(0,0,0,0.5);
    }

    /* Solo winner */
    .solo-winner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 1rem 0;
    }

    .solo-crown { font-size: 3rem; margin: 0; }
    .solo-name  { margin: 0; font-size: 1.3rem; font-weight: 800; color: #1E1B4B; }
    .solo-pts   { margin: 0; font-size: 1rem; font-weight: 700; color: #7C3AED; }
  `]
})
export class GameBoardComponent implements OnInit, OnDestroy {
  public gameState = inject(GameStateService);
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public sessionId = 0;
  public sessionGuestId = 0;

  public answered = signal(false);
  private questionStartTime = 0;

  public currentPlayer = computed(() =>
    this.gameState.participants().find(p => p.id === this.sessionGuestId)
  );

  public totalRounds = computed(() => {
    const session = this.gameState.session();
    return session?.state?.totalRounds ?? null;
  });

  constructor() {
    effect(() => {
      const q = this.gameState.currentQuestion();
      if (q) {
        this.questionStartTime = Date.now();
        this.answered.set(false);
      }
    });
  }

  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.sessionGuestId = Number(localStorage.getItem('guest-session-id')) || 0;

    this.gameState.connectToSession(this.sessionId, false);
  }

  isHost(): boolean {
    return this.authService.isAuthenticated();
  }

  submitAnswer(answer: number) {
    if (this.answered()) return;
    this.answered.set(true);
    const timeMs = Date.now() - this.questionStartTime;

    this.gameService.submitAnswer(this.sessionId, this.sessionGuestId, answer, timeMs)
      .subscribe({ error: () => this.answered.set(false) });
  }

  finishGame() {
    this.gameService.finishSession(this.sessionId, 'manual').subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: () => void this.router.navigate(['/dashboard']),
    });
  }

  backToDashboard() {
    void this.router.navigate(['/dashboard']);
  }

  backToHome() {
    localStorage.removeItem('guest-session-id');
    localStorage.removeItem('join-session-id');
    localStorage.removeItem('join-session-data');
    void this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.sessionId) {
      this.gameState.disconnect(this.sessionId);
    }
  }
}
