export interface LoginRequest { email: string; password: string; }

export interface RegisterRequest {
  firmName: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UserSummary {
  id: number;
  firmId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: UserSummary;
}
