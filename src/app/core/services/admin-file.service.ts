import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../auth/auth.storage';
import { AdminFile } from '../../features/avatar/avatar.models';

@Injectable({ providedIn: 'root' })
export class AdminFileService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<AdminFile[]> {
    return this.http.get<AdminFile[]>(`${this.apiBaseUrl}/api/admin/files`);
  }

  upload(file: File): Observable<AdminFile> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<AdminFile>(`${this.apiBaseUrl}/api/admin/files`, form);
  }

  replace(id: number, file: File): Observable<AdminFile> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<AdminFile>(`${this.apiBaseUrl}/api/admin/files/${id}`, form);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/api/admin/files/${id}`);
  }
}
