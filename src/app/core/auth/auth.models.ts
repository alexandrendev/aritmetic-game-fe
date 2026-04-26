export type AuthUser = {
  id: string | number;
  name?: string;
  username?: string;
  email: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type AuthApiResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  refresh_token?: string;
  user?: AuthUser;
};
