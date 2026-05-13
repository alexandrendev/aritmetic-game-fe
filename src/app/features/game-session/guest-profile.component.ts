import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AvatarService } from '../avatar/avatar.service';
import { Avatar } from '../avatar/avatar.models';

@Component({
  selector: 'app-guest-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="guest-profile-container">
      <h1>👤 Crie seu Perfil</h1>

      <div class="form-section">
        <label>Seu Apelido:</label>
        <input 
          type="text" 
          [(ngModel)]="nickname" 
          placeholder="Como você quer ser chamado?"
          maxlength="20"
        />
      </div>

      <div class="form-section">
        <label>Escolha um Avatar:</label>
        
        @if (avatarsLoading()) {
          <p class="loading">Carregando avatars...</p>
        } @else {
          <div class="avatar-grid">
            @for (avatar of avatars(); track avatar.id) {
              <button 
                type="button"
                (click)="selectAvatar(avatar)"
                [class.selected]="selectedAvatarId() === avatar.id"
                class="avatar-button"
              >
                @if (avatar.thumbnailUrl) {
                  <img [src]="avatar.thumbnailUrl" [alt]="avatar.name" />
                } @else {
                  <div class="avatar-placeholder">{{ avatar.name?.charAt(0) || '?' }}</div>
                }
              </button>
            }
          </div>
        }
      </div>

      <div class="actions">
        <button 
          (click)="onSubmit()" 
          [disabled]="loading() || !nickname.trim() || !selectedAvatarId()"
          class="btn-primary"
        >
          {{ loading() ? 'Entrando...' : 'Entrar na Sala' }}
        </button>

        <button 
          (click)="goBack()" 
          class="btn-secondary"
        >
          ← Voltar
        </button>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .guest-profile-container {
      max-width: 600px;
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

    .form-section {
      margin-bottom: 30px;
    }

    label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: #333;
    }

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #0b5d75;
      box-shadow: 0 0 4px rgba(11, 93, 117, 0.3);
    }

    .loading {
      text-align: center;
      color: #666;
      padding: 20px;
    }

    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
    }

    .avatar-button {
      aspect-ratio: 1;
      border: 3px solid #ddd;
      border-radius: 8px;
      background: #f5f5f5;
      cursor: pointer;
      transition: all 0.3s;
      padding: 0;
      overflow: hidden;
    }

    .avatar-button:hover {
      border-color: #0b5d75;
      transform: scale(1.05);
    }

    .avatar-button.selected {
      border-color: #0b5d75;
      background: #e3f2fd;
      box-shadow: 0 0 8px rgba(11, 93, 117, 0.3);
    }

    .avatar-button img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
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
  `]
})
export class GuestProfileComponent implements OnInit {
  private gameService = inject(GameService);
  private avatarService = inject(AvatarService);
  private router = inject(Router);

  nickname = '';
  avatars = signal<Avatar[]>([]);
  avatarsLoading = signal(false);
  selectedAvatarId = signal<number | string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  sessionId = 0;

  ngOnInit() {
    this.sessionId = Number(localStorage.getItem('join-session-id')) || 0;
    
    if (!this.sessionId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAvatars();
  }

  loadAvatars() {
    this.avatarsLoading.set(true);
    this.avatarService.list().subscribe({
      next: (avatars) => {
        this.avatars.set(avatars);
        if (avatars.length > 0) {
          this.selectedAvatarId.set(avatars[0].id);
        }
        this.avatarsLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar avatars');
        this.avatarsLoading.set(false);
      }
    });
  }

  selectAvatar(avatar: Avatar) {
    this.selectedAvatarId.set(avatar.id);
  }

  onSubmit() {
    if (!this.nickname.trim()) {
      this.error.set('Apelido é obrigatório');
      return;
    }

    if (!this.selectedAvatarId()) {
      this.error.set('Escolha um avatar');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.gameService.createGuestProfile({
      nickname: this.nickname,
      avatarId: this.selectedAvatarId() as number | string
    }).subscribe({
      next: (response) => {
        localStorage.setItem('guest-session-id', response.id);
        localStorage.setItem('guest-nickname', this.nickname);
        this.router.navigate(['/lobby', this.sessionId]);
      },
      error: (err) => {
        this.error.set('Erro ao criar perfil. Tente novamente.');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    localStorage.removeItem('join-session-id');
    this.router.navigate(['/dashboard']);
  }
}
