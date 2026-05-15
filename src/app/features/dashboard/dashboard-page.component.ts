import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { GameSessionService } from '../game-session/game-session.service';
import { GameSession } from '../game-session/game-session.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sessionService = inject(GameSessionService);

  readonly loading = signal(true);
  readonly sessionsLoading = signal(false);
  readonly user = this.authService.user;
  readonly displayName = computed(() => this.user()?.name ?? this.user()?.username ?? 'Estudante');
  readonly greeting = computed(() => `Olá, ${this.displayName()}!`);

  readonly sessions = signal<GameSession[]>([]);
  readonly closingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly activeSessions = computed(() =>
    this.sessions().filter(s => s.status === 'waiting' || s.status === 'playing')
  );

  readonly finishedSessions = computed(() =>
    this.sessions().filter(s => s.status === 'finished')
  );

  readonly hasActiveSession = computed(() => this.activeSessions().length > 0);

  constructor() {
    this.authService
      .me()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.loadSessions(),
        error: () => this.authService.logout()
      });
  }

  loadSessions(): void {
    this.sessionsLoading.set(true);
    this.sessionService
      .list()
      .pipe(finalize(() => this.sessionsLoading.set(false)))
      .subscribe({ next: sessions => this.sessions.set(sessions) });
  }

  createGame(): void {
    if (this.hasActiveSession()) return;
    void this.router.navigate(['/create-game']);
  }

  openSession(session: GameSession): void {
    void this.router.navigate(['/lobby', session.id]);
  }

  closeSession(session: GameSession): void {
    if (this.closingId()) return;
    this.closingId.set(session.id);
    this.sessionService
      .finish(session.id, 'closed_by_host')
      .pipe(finalize(() => this.closingId.set(null)))
      .subscribe({ next: () => this.loadSessions() });
  }

  deleteSession(session: GameSession): void {
    if (this.deletingId()) return;
    this.deletingId.set(session.id);
    this.sessionService
      .delete(session.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.sessions.update(list => list.filter(s => s.id !== session.id))
      });
  }

  goToAdminAvatars(): void {
    void this.router.navigate(['/admin/avatars']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  getDifficultyLabel(difficulty?: string): string {
    const map: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
    return map[difficulty ?? ''] ?? difficulty ?? '';
  }

  getStatusLabel(status?: string): string {
    const map: Record<string, string> = {
      waiting: 'Aguardando',
      playing: 'Em jogo',
      finished: 'Encerrada',
      ready: 'Pronta'
    };
    return map[status ?? ''] ?? status ?? '';
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getTopRanking(session: GameSession): { nickname: string; score: number }[] {
    return (session.state?.['ranking'] as Array<{ nickname: string; score: number }> | undefined)?.slice(0, 3) ?? [];
  }
}
