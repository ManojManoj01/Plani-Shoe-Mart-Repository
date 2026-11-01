import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { User, LoginCredentials, SignupData, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'stepstyle_auth_user';
const TOKEN_KEY = 'stepstyle_auth_token';

// Seeded mock users for local simulation
const MOCK_USERS: Array<User & { passwordHash: string }> = [
  {
    id: 'user_01',
    username: 'palani_shopper',
    firstName: 'Manoj',
    lastName: 'Kumar',
    email: 'demo@stepstyle.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'customer',
    passwordHash: 'Password123!' // In real backend this would be hashed on server
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);

  // Angular Signal state
  private currentUserSignal = signal<User | null>(this.getInitialUser());
  private tokenSignal = signal<string | null>(this.getInitialToken());
  public isLoading = signal<boolean>(false);

  // Readonly computed states
  public currentUser = this.currentUserSignal.asReadonly();
  public isLoggedIn = computed(() => !!this.currentUserSignal());
  public token = this.tokenSignal.asReadonly();

  // API endpoint for backend integration
  private authApiUrl = `${environment.apiUrl}/auth`;

  private getInitialUser(): User | null {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getInitialToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Log in user with credentials.
   * Connect to real backend by replacing with this.http.post<AuthResponse>(`${this.authApiUrl}/login`, creds)
   */
  public login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);

    const userIdentifier = credentials.emailOrUsername.trim();
    const payload = {
      usernameOrEmail: userIdentifier,
      password: credentials.password
    };

    return this.http.post<any>(`${this.authApiUrl}/login`, payload).pipe(
      map(res => {
        const backendUser = res?.user || res?.data || {};
        const user: User = {
          id: String(backendUser.id || 'user_' + Math.random().toString(36).substring(2, 9)),
          username: backendUser.username || userIdentifier,
          firstName: backendUser.firstName || 'User',
          lastName: backendUser.lastName || '',
          email: backendUser.email || userIdentifier,
          phone: backendUser.phone || '',
          role: (backendUser.role === 'ROLE_ADMIN' || backendUser.role === 'admin') ? 'admin' : 'customer',
          avatar: backendUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        };

        const token = res?.accessToken || res?.token || ('jwt_' + btoa(user.id + ':' + Date.now()));

        return {
          user,
          token,
          message: res?.message || 'Logged in successfully'
        };
      }),
      tap(authRes => {
        this.isLoading.set(false);
        this.saveSession(authRes.user, authRes.token, credentials.rememberMe ?? true);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        let errorMsg = 'Invalid email or password.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 0) {
          errorMsg = 'Cannot connect to Spring Boot backend (http://localhost:8080). Please ensure server is running.';
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Create account / Signup
   * Calls Spring Boot backend: POST http://localhost:8080/api/auth/signup
   */
  public signup(data: SignupData): Observable<AuthResponse> {
    this.isLoading.set(true);

    // Matches Spring Boot SignupRequest DTO
    const payload = {
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      confirmPassword: data.confirmPassword || data.password
    };

    return this.http.post<any>(`${this.authApiUrl}/signup`, payload).pipe(
      map(res => {
        // Spring Boot returns: ApiResponse<UserSummaryDto> ({ success: true, message: '...', data: { id, username, email, firstName, lastName, role } })
        const backendUser = res?.data || res?.user || {};
        const user: User = {
          id: String(backendUser.id || 'user_' + Math.random().toString(36).substring(2, 9)),
          username: backendUser.username || payload.username,
          firstName: backendUser.firstName || payload.firstName,
          lastName: backendUser.lastName || payload.lastName,
          email: backendUser.email || payload.email,
          phone: data.phone?.trim() || '',
          role: backendUser.role === 'ROLE_ADMIN' ? 'admin' : 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        };

        const token = res?.token || res?.accessToken || ('jwt_' + btoa(user.id + ':' + Date.now()));

        return {
          user,
          token,
          message: res?.message || 'Account created successfully'
        };
      }),
      tap(authRes => {
        this.isLoading.set(false);
        this.saveSession(authRes.user, authRes.token, true);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        let errorMsg = 'Registration failed. Please try again.';

        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.validationErrors) {
          const errors = Object.values(err.error.validationErrors);
          errorMsg = errors.join(', ');
        } else if (err.status === 0) {
          errorMsg = 'Cannot connect to Spring Boot backend (http://localhost:8080). Please ensure server is running.';
        } else if (err.message) {
          errorMsg = err.message;
        }

        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Request password reset link
   */
  public forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.authApiUrl}/forgot-password`, { email: email.trim().toLowerCase() }).pipe(
      map(res => ({
        success: true,
        message: res?.message || `A secure password reset link has been dispatched to ${email}.`
      })),
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Could not send reset password request.';
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Log out and clear state
   */
  public logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);

    if (this.isBrowser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      } catch (err) {
        console.error('Error clearing session:', err);
      }
    }
  }

  private saveSession(user: User, token: string, remember: boolean): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);

    if (!this.isBrowser) return;

    try {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify(user));
      storage.setItem(TOKEN_KEY, token);

      // Clean up opposite storage
      const otherStorage = remember ? sessionStorage : localStorage;
      otherStorage.removeItem(STORAGE_KEY);
      otherStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Error storing session:', err);
    }
  }

  public getDemoCredentials(): { email: string; pass: string } {
    return {
      email: 'demo@stepstyle.com',
      pass: 'Password123!'
    };
  }
}
