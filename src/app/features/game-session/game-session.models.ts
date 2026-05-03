export type Difficulty = 'easy' | 'medium' | 'hard' | string;

export interface CreateGameSessionPayload {
  name: string;
  difficult: Difficulty;
}

export interface StartGameSessionPayload {
  target: number;
  totalRounds: number;
  responseWindowMs: number;
}

export interface AddGuestPayload {
  guestId: string | number;
}

export interface AnswerPayload {
  gameSessionGuestId: string;
  answer: number;
  timeMs: number;
}

export interface GameSession {
  id: string;
  name?: string;
  code?: string;
  status?: string;
  difficult?: Difficulty;
  [key: string]: unknown;
}

export interface GameSessionGuest {
  id: string;
  guestId?: string | number;
  name?: string;
  score?: number;
  [key: string]: unknown;
}
