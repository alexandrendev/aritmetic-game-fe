import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-game-container">
      <h1>🎮 Criar Nova Sala</h1>
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Nome da Sala:</label>
          <input 
            id="name"
            type="text" 
            [(ngModel)]="sessionName" 
            name="sessionName"
            placeholder="Ex: Turma 7B - Módulo 1"
            required
          />
        </div>

        <div class="form-group">
          <label for="difficulty">Dificuldade:</label>
          <select [(ngModel)]="difficulty" name="difficulty" id="difficulty">
            <option value="easy">🟢 Fácil</option>
            <option value="medium">🟡 Médio</option>
            <option value="hard">🔴 Difícil</option>
          </select>
        </div>

        <button 
          type="submit" 
          [disabled]="loading()"
          class="btn-primary"
        >
          {{ loading() ? 'Criando...' : 'Criar Sala' }}
        </button>

        @if (error()) {
          <div class="error-message">{{ error() }}</div>
        }
      </form>
    </div>
  `,
  styles: [`
    .create-game-container {
      max-width: 500px;
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

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      box-sizing: border-box;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #0b5d75;
      box-shadow: 0 0 4px rgba(11, 93, 117, 0.3);
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: #0b5d75;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0a4958;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
export class CreateGameComponent {
  private gameService = inject(GameService);
  private router = inject(Router);

  sessionName = '';
  difficulty = 'easy';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.sessionName.trim()) {
      this.error.set('Nome da sala é obrigatório');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.gameService.createSession({
      name: this.sessionName,
      difficulty: this.difficulty
    }).subscribe({
      next: (response) => {
        // Salva o sessionId no localStorage para usar depois
        localStorage.setItem('created-session-id', response.id);
        this.router.navigate(['/game-config', response.id]);
      },
      error: (err) => {
        this.error.set('Erro ao criar sala. Tente novamente.');
        this.loading.set(false);
      }
    });
  }
}
