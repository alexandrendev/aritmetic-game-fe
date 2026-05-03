import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/auth/auth.storage';
import { Avatar } from './avatar.models';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly jsonHeaders = new HttpHeaders({ Accept: 'application/json' });

  list(): Observable<Avatar[]> {
    return this.http.get<Avatar[]>(`${this.apiBaseUrl}/files/avatars`, {
      headers: this.jsonHeaders
    });
  }
}
