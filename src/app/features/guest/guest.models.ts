export interface CreateGuestPayload {
  nickname: string;
  avatarId?: number;
}

export interface Guest {
  id: string;
  nickname: string;
  avatarId?: number;
  createdAt?: string;
  [key: string]: unknown;
}
