import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrap">
      <div class="card">

        <header class="card-header">
          <a routerLink="/dashboard" class="back-link" (click)="goBack()"><i class="fas fa-arrow-left"></i> Dashboard</a>
          <span class="tag"><i class="fas fa-bolt"></i> O Jogo · Host</span>
          <h1>Criar Nova Sala</h1>
          <p class="subtitle">Configure a sala e compartilhe o código com seus alunos</p>
        </header>

        <form (ngSubmit)="onSubmit()" class="form">

          <div class="field">
            <label for="name">Nome da Sala</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="sessionName"
              name="sessionName"
              placeholder="Ex: Turma 7B – Tabuada do 6"
              autocomplete="off"
              required
            />
          </div>

          <div class="field">
            <label for="difficulty">Dificuldade inicial</label>
            <div class="difficulty-grid">
              @for (opt of difficultyOptions; track opt.value) {
                <button
                  type="button"
                  class="diff-btn"
                  [class.selected]="difficulty === opt.value"
                  (click)="difficulty = opt.value"
                >
                  <span class="diff-icon" [innerHTML]="opt.icon"></span>
                  <span class="diff-label">{{ opt.label }}</span>
                  <span class="diff-desc">{{ opt.desc }}</span>
                </button>
              }
            </div>
          </div>

          @if (error()) {
            <p class="error-msg" role="alert">{{ error() }}</p>
          }

          <button type="submit" class="btn-primary" [disabled]="loading() || !sessionName.trim()">
            <i class="fas fa-rocket" *ngIf="!loading()" style="margin-right: 0.5rem"></i>
            {{ loading() ? 'Criando sala...' : 'Criar Sala' }}
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-wrap {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: clamp(1rem, 3vw, 2rem);
    }

    .card {
      width: min(520px, 100%);
      background: #fff;
      border-radius: 28px;
      padding: clamp(1.6rem, 4vw, 2.4rem);
      box-shadow: 0 20px 60px rgba(109, 40, 217, 0.14);
      border: 2px solid rgba(167, 139, 250, 0.3);
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .card-header { display: flex; flex-direction: column; gap: 0.4rem; }

    .back-link {
      display: inline-block;
      width: fit-content;
      font-size: 0.82rem;
      font-weight: 700;
      color: #7C3AED;
      text-decoration: none;
      margin-bottom: 0.25rem;
    }

    .back-link:hover { text-decoration: underline; }

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
      font-size: clamp(1.5rem, 4vw, 1.9rem);
      font-weight: 800;
      color: #1E1B4B;
      line-height: 1.2;
    }

    .subtitle {
      margin: 0;
      font-size: 0.9rem;
      color: #6D28D9;
    }

    .form { display: flex; flex-direction: column; gap: 1.25rem; }

    .field { display: flex; flex-direction: column; gap: 0.45rem; }

    label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #4C1D95;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    input {
      width: 100%;
      border: 2px solid #E5E7EB;
      border-radius: 14px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-family: inherit;
      color: #1E1B4B;
      background: #fff;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    input:focus {
      outline: none;
      border-color: #7C3AED;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
    }

    input::placeholder { color: #9CA3AF; }

    /* Difficulty selector */
    .difficulty-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.6rem;
    }

    .diff-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      padding: 0.85rem 0.5rem;
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      background: #fff;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    .diff-btn:hover { border-color: #A78BFA; background: #F5F3FF; }

    .diff-btn.selected {
      border-color: #7C3AED;
      background: #F5F3FF;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
    }

    .diff-icon { font-size: 1.4rem; }

    .diff-label {
      font-size: 0.82rem;
      font-weight: 800;
      color: #1E1B4B;
    }

    .diff-desc {
      font-size: 0.72rem;
      color: #6D28D9;
    }

    .btn-primary {
      width: 100%;
      border: 0;
      border-radius: 14px;
      padding: 0.95rem 1rem;
      font-size: 1.05rem;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      background: linear-gradient(135deg, #7C3AED, #A855F7);
      color: #fff;
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(124, 58, 237, 0.45);
    }

    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .error-msg {
      margin: 0;
      color: #DC2626;
      font-weight: 600;
      font-size: 0.9rem;
      text-align: center;
    }
  `]
})
export class CreateGameComponent {
  private gameService = inject(GameService);
  private router = inject(Router);

  sessionName = '';
  difficulty = 'easy';
  loading = signal(false);
  error = signal<string | null>(null);

  readonly difficultyOptions = [
    { value: 'easy',   icon: '<i class="fas fa-lightbulb" style="color: #10b981"></i>', label: 'Fácil',  desc: 'Tabuada 1–10'  },
    { value: 'medium', icon: '<i class="fas fa-bolt" style="color: #f59e0b"></i>', label: 'Médio',  desc: 'Tabuada 11–20' },
    { value: 'hard',   icon: '<i class="fas fa-fire" style="color: #ef4444"></i>', label: 'Difícil', desc: 'Tabuada 21–30' },
  ];

  goBack() {
    void this.router.navigate(['/dashboard']);
  }

  onSubmit() {
    if (!this.sessionName.trim()) {
      this.error.set('Nome da sala é obrigatório');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.gameService.createSession({
      name: this.sessionName.trim(),
      difficulty: this.difficulty,
    }).subscribe({
      next: (response) => void this.router.navigate(['/lobby', response.id]),
      error: () => {
        this.error.set('Erro ao criar sala. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}
