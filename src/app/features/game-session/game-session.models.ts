export type Difficulty = 'easy' | 'medium' | 'hard' | string;

export interface CreateGameSessionPayload {
  name: string;
  difficulty: Difficulty;
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

export interface SessionRanking {
  position: number;
  id: number;
  guestId: number;
  nickname: string;
  score: number;
  lives: number;
  isAlive: boolean;
}

export interface SessionParticipant {
  id: number;
  nickname: string;
  score: number;
  lives: number;
  isAlive: boolean;
}

export interface GameSessionState {
  round?: number;
  totalRounds?: number;
  startedAt?: string;
  finishedAt?: string;
  finishReason?: string;
  ranking?: SessionRanking[];
}

export interface GameSession {
  id: string;
  name?: string;
  code?: string;
  status?: 'waiting' | 'ready' | 'playing' | 'finished' | string;
  difficulty?: Difficulty;
  createdAt?: string;
  participantsCount?: number;
  participants?: SessionParticipant[];
  state?: GameSessionState;
  [key: string]: unknown;
}

export interface GameSessionGuest {
  id: string;
  guestId?: string | number;
  name?: string;
  score?: number;
  [key: string]: unknown;
}
