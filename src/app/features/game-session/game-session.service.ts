import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/auth/auth.storage';
import {
  AddGuestPayload,
  AnswerPayload,
  CreateGameSessionPayload,
  GameSession,
  GameSessionGuest,
  StartGameSessionPayload
} from './game-session.models';

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly jsonHeaders = new HttpHeaders({ Accept: 'application/json' });

  create(payload: CreateGameSessionPayload): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiBaseUrl}/api/game-sessions`, payload, {
      headers: this.jsonHeaders
    });
  }

  get(sessionId: string): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.apiBaseUrl}/api/game-sessions/${sessionId}`, {
      headers: this.jsonHeaders
    });
  }

  list(): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.apiBaseUrl}/api/game-sessions`, {
      headers: this.jsonHeaders
    });
  }

  start(sessionId: string, payload: StartGameSessionPayload): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiBaseUrl}/api/game-sessions/${sessionId}/start`, payload, {
      headers: this.jsonHeaders
    });
  }

  addGuest(sessionId: string, payload: AddGuestPayload): Observable<GameSessionGuest> {
    return this.http.post<GameSessionGuest>(`${this.apiBaseUrl}/api/game-sessions/${sessionId}/guests`, payload, {
      headers: this.jsonHeaders
    });
  }

  answer(sessionId: string, payload: AnswerPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/game-sessions/${sessionId}/answer`, payload, {
      headers: this.jsonHeaders
    });
  }

  getByCode(code: string): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.apiBaseUrl}/api/game-sessions/code/${code}`, {
      headers: this.jsonHeaders
    });
  }

  finish(sessionId: string, reason = 'manual'): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/game-sessions/${sessionId}/finish`, { reason }, {
      headers: this.jsonHeaders
    });
  }

  delete(sessionId: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiBaseUrl}/api/game-sessions/${sessionId}`, {
      headers: this.jsonHeaders
    });
  }

  kickGuest(sessionId: string | number, participantId: string | number): Observable<unknown> {
    return this.http.delete<unknown>(
      `${this.apiBaseUrl}/api/game-sessions/${sessionId}/guests/${participantId}`,
      { headers: this.jsonHeaders }
    );
  }
}
