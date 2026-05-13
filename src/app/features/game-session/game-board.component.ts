import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-board-container p-4">
      
      <!-- HUD do Jogador (Status) -->
      @if (currentPlayer(); as player) {
        <div class="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200">
          <div class="text-lg font-bold text-gray-700">👤 {{ player.nickname }}</div>
          <div class="text-lg font-bold text-red-500">Vidas: {{ player.lives }} ❤️</div>
          <div class="text-lg font-bold text-green-600">Score: {{ player.score }} pts</div>
        </div>
      }

      <!-- Status de Espera -->
      @if (!gameState.currentQuestion() && !gameState.isGameOver()) {
        <div class="text-center mt-10">
          <h2 class="text-2xl font-bold">Aguardando a Rodada Iniciar...</h2>
          <p>Prepare-se para o próximo cálculo!</p>
        </div>
      }

      <!-- Pergunta Ativa -->
      @if (gameState.currentQuestion(); as question) {
        <div class="question-card bg-white shadow-lg rounded-xl p-8 text-center mt-8">
          <h3 class="text-xl text-gray-500">Rodada {{ gameState.round() }}</h3>
          <h1 class="text-6xl font-extrabold my-6 text-primary">{{ question.operation }}</h1>
          
          <div class="grid grid-cols-2 gap-4 mt-6">
            @for (option of question.options; track option) {
              <button 
                (click)="submitAnswer(option)" 
                [disabled]="isAnswering()"
                [class.opacity-50]="isAnswering()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-2xl transition">
                {{ option }}
              </button>
            }
          </div>
        </div>
      }

      <!-- Tela de Fim de Jogo (Ranking) -->
      @if (gameState.isGameOver()) {
        <div class="ranking-card bg-white shadow-lg rounded-xl p-8 mt-8">
          <h2 class="text-3xl font-bold text-center mb-6 text-green-600">Fim de Jogo!</h2>
          
          <ol class="space-y-3">
            @for (player of gameState.ranking(); track player.id) {
              <li class="flex justify-between items-center bg-gray-100 p-4 rounded text-lg font-medium">
                <span>{{ player.position }}º - {{ player.nickname }}</span>
                <span>{{ player.score }} pts</span>
              </li>
            }
          </ol>
        </div>
      }

    </div>
  `
})
export class GameBoardComponent implements OnInit, OnDestroy {
  public gameState = inject(GameStateService);
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);
  
  public sessionId = 0; 
  public sessionGuestId = 0; 
  
  public isAnswering = signal(false);
  private questionStartTime = 0;

  // Sinal computado para sempre retornar os dados atualizados do jogador atual baseado no Pusher
  public currentPlayer = computed(() => {
    return this.gameState.participants().find(p => p.id === this.sessionGuestId);
  });

  ngOnInit() {
    // Busca os IDs reais na rota ativa e no LocalStorage
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    // O 'guest-session-id' deverá ser salvo no LocalStorage na tela de Lobby ao entrar na sala
    this.sessionGuestId = Number(localStorage.getItem('guest-session-id')) || 0;

    this.gameState.connectToSession(this.sessionId);

    // Podemos registrar a hora que a questão apareceu para calcular o 'timeMs'
    this.questionStartTime = Date.now();
  }

  submitAnswer(answer: number) {
    this.isAnswering.set(true);
    const timeTakenMs = Date.now() - this.questionStartTime;

    this.gameService.submitAnswer(this.sessionId, this.sessionGuestId, answer, timeTakenMs)
      .subscribe({
        next: (result) => {
          console.log('Resposta computada:', result);
          // A tela será atualizada automaticamente pelos eventos do Pusher no GameStateService
          this.isAnswering.set(false);
        },
        error: () => this.isAnswering.set(false)
      });
  }

  ngOnDestroy() {
    if (this.sessionId) {
      this.gameState.disconnect(this.sessionId);
    }
  }
}