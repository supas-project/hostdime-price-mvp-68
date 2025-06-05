
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nome_completo?: string;
  tipo: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

export interface SessionConfig {
  timeout: number; // em minutos
  maxAttempts: number;
  blockDuration: number; // em minutos
}
