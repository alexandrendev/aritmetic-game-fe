import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="join-game-container">
      <h1>🎮 Entrar em uma Sala</h1>
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="code">Código da Sala:</label>
          <input 
            id="code"
            type="text" 
            [(ngModel)]="sessionCode" 
            name="sessionCode"
            placeholder="Ex: ABC123"
            maxlength="10"
            required
            (keyup)="sessionCode = sessionCode.toUpperCase()"
          />
          <small>Peça ao professor o código da sala</small>
        </div>

        <button 
          type="submit" 
          [disabled]="loading()"
          class="btn-primary"
        >
          {{ loading() ? 'Entrando...' : 'Entrar na Sala' }}
        </button>

        @if (error()) {
          <div class="error-message">{{ error() }}</div>
        }
      </form>

      <div class="divider">ou</div>

      <button (click)="goBack()" class="btn-secondary">
        ← Voltar
      </button>
    </div>
  `,
  styles: [`
    .join-game-container {
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

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #0b5d75;
      box-shadow: 0 0 4px rgba(11, 93, 117, 0.3);
    }

    small {
      display: block;
      margin-top: 5px;
      color: #666;
      font-size: 12px;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 10px;
    }

    .btn-primary {
      background: #0b5d75;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0a4958;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #ddd;
      color: #333;
    }

    .btn-secondary:hover {
      background: #ccc;
    }

    .error-message {
      margin-top: 15px;
      padding: 10px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c00;
    }

    .divider {
      text-align: center;
      margin: 20px 0;
      color: #999;
    }
  `]
})
export class JoinGameComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sessionCode = '';
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.sessionCode = code.toUpperCase();
      this.onSubmit();
    }
  }

  onSubmit() {
    if (!this.sessionCode.trim()) {
      this.error.set('Código da sala é obrigatório');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.gameService.getSessionByCode(this.sessionCode).subscribe({
      next: (response) => {
        localStorage.setItem('join-session-id', response.id);
        this.router.navigate(['/guest-profile']);
      },
      error: (err) => {
        this.error.set('Sala não encontrada. Verifique o código e tente novamente.');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
