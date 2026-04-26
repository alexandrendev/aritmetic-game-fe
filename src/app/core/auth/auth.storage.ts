import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => ''
});

export const ACCESS_TOKEN_KEY = 'math-game-access-token';
export const REFRESH_TOKEN_KEY = 'math-game-refresh-token';
