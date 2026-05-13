import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { AvatarService } from '../avatar/avatar.service';
import { Avatar } from '../avatar/avatar.models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-guest-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <div class="card">

        <header class="card-header">
          <button class="back-link" (click)="goBack()">← Voltar</button>
          <span class="tag">⚡ O Jogo · Convidado</span>
          <h1>Criar seu Perfil</h1>
          <p class="subtitle">Escolha um apelido e um avatar para entrar na sala</p>
        </header>

        <div class="form">

          <div class="field">
            <label for="nickname">Apelido</label>
            <input
              id="nickname"
              type="text"
              [(ngModel)]="nickname"
              placeholder="Como você quer ser chamado?"
              maxlength="20"
              autocomplete="off"
            />
          </div>

          <div class="field">
            <label>Avatar</label>

            @if (avatarsLoading()) {
              <div class="avatars-loading">
                <span>Carregando avatars...</span>
              </div>
            } @else {
              <div class="avatar-grid">
                @for (avatar of avatars(); track avatar.id) {
                  <button
                    type="button"
                    class="avatar-btn"
                    [class.selected]="selectedAvatarId() === avatar.id"
                    (click)="selectAvatar(avatar)"
                  >
                    @if (avatar.path ?? avatar.thumbnailUrl ?? avatar.url; as imgUrl) {
                      <img [src]="imgUrl" [alt]="avatar.name ?? 'Avatar'" />
                    } @else {
                      <span class="avatar-initial">{{ avatar.name?.charAt(0) || '?' }}</span>
                    }
                  </button>
                }
              </div>
            }
          </div>

          @if (error()) {
            <p class="error-msg" role="alert">{{ error() }}</p>
          }

          <button
            class="btn-primary"
            (click)="onSubmit()"
            [disabled]="loading() || !nickname.trim() || !selectedAvatarId()"
          >
            {{ loading() ? 'Entrando na sala...' : '🎮 Entrar na Sala' }}
          </button>

        </div>
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
      width: min(540px, 100%);
      background: #fff;
      border-radius: 28px;
      padding: clamp(1.6rem, 4vw, 2.4rem);
      box-shadow: 0 20px 60px rgba(249, 115, 22, 0.12);
      border: 2px solid rgba(249, 115, 22, 0.2);
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
      color: #EA580C;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      font-family: inherit;
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
      color: #9A3412;
      background: #FFF7ED;
      border: 1.5px solid #FED7AA;
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

    .subtitle { margin: 0; font-size: 0.9rem; color: #EA580C; }

    .form { display: flex; flex-direction: column; gap: 1.25rem; }

    .field { display: flex; flex-direction: column; gap: 0.45rem; }

    label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #9A3412;
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
      border-color: #F97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
    }

    input::placeholder { color: #9CA3AF; }

    /* Avatars */
    .avatars-loading {
      padding: 1.5rem;
      text-align: center;
      color: #9CA3AF;
      font-size: 0.9rem;
    }

    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
      gap: 0.6rem;
    }

    .avatar-btn {
      aspect-ratio: 1;
      border: 2.5px solid #E5E7EB;
      border-radius: 14px;
      background: #F9FAFB;
      cursor: pointer;
      padding: 0;
      overflow: hidden;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
    }

    .avatar-btn:hover {
      border-color: #F97316;
      transform: scale(1.05);
    }

    .avatar-btn.selected {
      border-color: #F97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
    }

    .avatar-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .avatar-initial {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(135deg, #F97316, #FB923C);
      color: #fff;
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
      background: linear-gradient(135deg, #EA580C, #F97316);
      color: #fff;
      box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(234, 88, 12, 0.45);
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
export class GuestProfileComponent implements OnInit {
  private gameService = inject(GameService);
  private avatarService = inject(AvatarService);
  private authService = inject(AuthService);
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
      void this.router.navigate([this.authService.isAuthenticated() ? '/dashboard' : '/']);
      return;
    }

    this.loadAvatars();
  }

  loadAvatars() {
    this.avatarsLoading.set(true);
    this.avatarService.list().subscribe({
      next: (avatars) => {
        this.avatars.set(avatars);
        if (avatars.length > 0) this.selectedAvatarId.set(avatars[0].id);
        this.avatarsLoading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar avatars');
        this.avatarsLoading.set(false);
      },
    });
  }

  selectAvatar(avatar: Avatar) {
    this.selectedAvatarId.set(avatar.id);
  }

  onSubmit() {
    if (!this.nickname.trim()) { this.error.set('Apelido é obrigatório'); return; }
    if (!this.selectedAvatarId()) { this.error.set('Escolha um avatar'); return; }

    this.loading.set(true);
    this.error.set(null);

    this.gameService.createGuestProfile({
      nickname: this.nickname.trim(),
      avatarId: this.selectedAvatarId() as number | string,
    }).pipe(
      switchMap((guest) => this.gameService.joinSession(this.sessionId, guest.id))
    ).subscribe({
      next: (sessionGuest) => {
        localStorage.setItem('guest-session-id', String(sessionGuest.id));
        localStorage.setItem('guest-nickname', this.nickname.trim());
        void this.router.navigate(['/lobby', this.sessionId]);
      },
      error: () => {
        this.error.set('Erro ao entrar na sala. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  goBack() {
    localStorage.removeItem('join-session-id');
    void this.router.navigate([this.authService.isAuthenticated() ? '/dashboard' : '/']);
  }
}
