import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../auth/auth.storage';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  // ==========================================
  // FLUXO DO HOST
  // ==========================================

  createSession(data: { name: string; difficulty: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/game-sessions`, data);
  }

  startSession(sessionId: number, params: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/game-sessions/${sessionId}/start`, params);
  }

  finishSession(sessionId: number, reason: string = 'manual'): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/game-sessions/${sessionId}/finish`, { reason });
  }

  // ==========================================
  // FLUXO DO GUEST
  // ==========================================

  createGuestProfile(data: { nickname: string; avatarId: number | string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/guests`, data);
  }

  getSessionByCode(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/game-sessions/code/${code}`);
  }

  joinSession(sessionId: number, guestId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/game-sessions/${sessionId}/guests`, { guestId });
  }

  submitAnswer(sessionId: number, sessionGuestId: number, answer: number, timeMs: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/game-sessions/${sessionId}/answer`, {
      gameSessionGuestId: sessionGuestId,
      answer,
      timeMs
    });
  }

  // ==========================================
  // REIDRATAÇÃO (Reconexão)
  // ==========================================

  getSessionDetails(sessionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/game-sessions/${sessionId}`);
  }
}