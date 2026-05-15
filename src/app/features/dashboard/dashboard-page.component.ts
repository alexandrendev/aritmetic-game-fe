import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly user = this.authService.user;
  readonly displayName = computed(() => this.user()?.name ?? this.user()?.username ?? 'Estudante');
  readonly greeting = computed(() => {
    const currentName = this.displayName();
    return `Ola, ${currentName}!`;
  });

  constructor() {
    this.authService
      .me()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        error: () => {
          this.authService.logout();
        }
      });
  }

  createGame(): void {
    void this.router.navigate(['/create-game']);
  }

  goToAdminAvatars(): void {
    void this.router.navigate(['/admin/avatars']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
