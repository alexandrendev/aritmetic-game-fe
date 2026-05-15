import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminFileService } from '../../core/services/admin-file.service';
import { AdminFile } from '../avatar/avatar.models';

@Component({
  selector: 'app-admin-avatars',
  templateUrl: './admin-avatars.component.html',
  styleUrl: './admin-avatars.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAvatarsComponent {
  private readonly adminFileService = inject(AdminFileService);
  private readonly router = inject(Router);

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly replaceInput = viewChild.required<ElementRef<HTMLInputElement>>('replaceInput');

  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly avatars = signal<AdminFile[]>([]);
  readonly deletingId = signal<number | null>(null);
  readonly confirmDeleteId = signal<number | null>(null);
  readonly replacingId = signal<number | null>(null);

  private successTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadAvatars();
  }

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  triggerUpload(): void {
    this.fileInput().nativeElement.value = '';
    this.fileInput().nativeElement.click();
  }

  triggerReplace(id: number): void {
    this.replacingId.set(id);
    this.confirmDeleteId.set(null);
    this.replaceInput().nativeElement.value = '';
    this.replaceInput().nativeElement.click();
  }

  confirmDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  executeDelete(id: number): void {
    this.deletingId.set(id);
    this.confirmDeleteId.set(null);
    this.adminFileService.delete(id).pipe(
      finalize(() => this.deletingId.set(null))
    ).subscribe({
      next: () => {
        this.avatars.update(list => list.filter(a => a.id !== id));
        this.showSuccess('Avatar excluído com sucesso.');
      },
      error: (err) => {
        const msg = err.status === 409
          ? 'Este avatar está em uso por um ou mais jogadores e não pode ser excluído.'
          : 'Erro ao excluir o avatar.';
        this.error.set(msg);
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.error.set(null);
    this.adminFileService.upload(file).pipe(
      finalize(() => this.uploading.set(false))
    ).subscribe({
      next: (newFile) => {
        this.avatars.update(list => [newFile, ...list]);
        this.showSuccess('Avatar adicionado com sucesso.');
      },
      error: () => this.error.set('Erro ao fazer upload. Verifique o formato e tamanho do arquivo (máx. 5 MB).')
    });
  }

  onReplaceSelected(event: Event): void {
    const id = this.replacingId();
    if (id === null) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) { this.replacingId.set(null); return; }

    this.uploading.set(true);
    this.error.set(null);
    this.adminFileService.replace(id, file).pipe(
      finalize(() => { this.uploading.set(false); this.replacingId.set(null); })
    ).subscribe({
      next: (updated) => {
        this.avatars.update(list => list.map(a => a.id === id ? updated : a));
        this.showSuccess('Avatar substituído com sucesso.');
      },
      error: () => this.error.set('Erro ao substituir o avatar.')
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  private loadAvatars(): void {
    this.adminFileService.list().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (files) => this.avatars.set(files),
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível carregar os avatares.');
      }
    });
  }

  private showSuccess(message: string): void {
    this.success.set(message);
    if (this.successTimer) clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => this.success.set(null), 3000);
  }
}
