import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameSessionService } from '../game-session/game-session.service';

@Component({
  selector: 'app-home-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly gameSessionService = inject(GameSessionService);
  private readonly router = inject(Router);

  roomCode = '';
  readonly loading = signal(false);
  readonly error = signal('');

  joinRoom(): void {
    const code = this.roomCode.trim().toUpperCase();
    if (!code) {
      this.error.set('Digite o código da sala.');
      return;
    }
    this.error.set('');
    this.loading.set(true);

    this.gameSessionService.getByCode(code).subscribe({
      next: (session) => {
        localStorage.setItem('join-session-id', String(session.id));
        localStorage.setItem('join-session-data', JSON.stringify(session));
        void this.router.navigate(['/guest-profile']);
      },
      error: () => {
        this.error.set('Sala não encontrada. Verifique o código e tente novamente.');
        this.loading.set(false);
      }
    });
  }
}
