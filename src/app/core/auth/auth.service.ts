import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import {
  ACCESS_TOKEN_KEY,
  API_BASE_URL,
  REFRESH_TOKEN_KEY
} from './auth.storage';
import { AuthApiResponse, AuthTokens, AuthUser, LoginPayload, RegisterPayload } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly accessTokenSignal = signal<string | null>(this.readStorage(ACCESS_TOKEN_KEY));
  private readonly refreshTokenSignal = signal<string | null>(this.readStorage(REFRESH_TOKEN_KEY));
  private refreshInFlight$: Observable<string | null> | null = null;
  private readonly jsonHeaders = new HttpHeaders({
    Accept: 'application/json'
  });

  readonly user = computed(() => this.userSignal());
  readonly accessToken = computed(() => this.accessTokenSignal());
  readonly isAuthenticated = computed(() => Boolean(this.accessTokenSignal()));

  login(payload: LoginPayload): Observable<AuthUser | null> {
    return this.http
      .post<AuthApiResponse>(`${this.apiBaseUrl}/api/login`,
        {
          identifier: payload.email,
          password: payload.password
        }, {
        headers: this.jsonHeaders
      })
      .pipe(
        tap((response) => this.persistTokens(this.extractTokens(response))),
        map((response) => response.user ?? null)
      );
  }

  register(payload: RegisterPayload): Observable<AuthUser | null> {
    return this.http
      .post<AuthApiResponse>(`${this.apiBaseUrl}/api/register`, payload, {
        headers: this.jsonHeaders
      })
      .pipe(
        tap((response) => this.persistTokens(this.extractTokens(response))),
        map((response) => response.user ?? null)
      );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiBaseUrl}/api/me`, {
      headers: this.jsonHeaders
    }).pipe(
      tap((me) => this.userSignal.set(me))
    );
  }

  refreshToken(): Observable<string | null> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const token = this.refreshTokenSignal();

    if (!token) {
      return of(null);
    }

    this.refreshInFlight$ = this.http
      .post<AuthApiResponse>(`${this.apiBaseUrl}/api/token/refresh`, {
        refreshToken: token
      }, {
        headers: this.jsonHeaders
      })
      .pipe(
        map((response) => {
          const extracted = this.extractTokens(response);

          if (!extracted.accessToken) {
            this.clearSession();
            return null;
          }

          this.persistTokens({
            accessToken: extracted.accessToken,
            refreshToken: extracted.refreshToken ?? token
          });

          return extracted.accessToken;
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight$;
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  hydrateFromStorage(): void {
    this.accessTokenSignal.set(this.readStorage(ACCESS_TOKEN_KEY));
    this.refreshTokenSignal.set(this.readStorage(REFRESH_TOKEN_KEY));
  }

  clearSession(): void {
    this.userSignal.set(null);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private persistTokens(tokens: Partial<AuthTokens>): void {
    if (tokens.accessToken) {
      this.accessTokenSignal.set(tokens.accessToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    }

    if (tokens.refreshToken) {
      this.refreshTokenSignal.set(tokens.refreshToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  private extractTokens(response: AuthApiResponse): Partial<AuthTokens> {
    return {
      accessToken: response.accessToken ?? response.token,
      refreshToken: response.refreshToken ?? response.refresh_token
    };
  }

  private readStorage(key: string): string | null {
    return localStorage.getItem(key);
  }
}
