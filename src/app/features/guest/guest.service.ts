import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/auth/auth.storage';
import { CreateGuestPayload, Guest } from './guest.models';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly jsonHeaders = new HttpHeaders({ Accept: 'application/json' });

  create(payload: CreateGuestPayload): Observable<Guest> {
    return this.http.post<Guest>(`${this.apiBaseUrl}/guests`, payload, {
      headers: this.jsonHeaders
    });
  }
}
