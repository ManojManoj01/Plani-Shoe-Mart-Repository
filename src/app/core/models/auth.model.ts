export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER' | string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: AdminUser;
  message?: string;
}
