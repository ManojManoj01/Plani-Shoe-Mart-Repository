import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AdminUser, LoginCredentials, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const ADMIN_STORAGE_KEY = 'stepstyle_admin_user';
const ADMIN_TOKEN_KEY = 'stepstyle_admin_token';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<AdminUser | null>(this.getInitialUser());
  private tokenSignal = signal<string | null>(this.getInitialToken());
  public isLoading = signal<boolean>(false);

  public currentUser = this.currentUserSignal.asReadonly();
  public token = this.tokenSignal.asReadonly();
  public isLoggedIn = computed(() => {
    const user = this.currentUserSignal();
    const token = this.tokenSignal();
    return !!token && !!user && user.role === 'ROLE_ADMIN';
  });

  private authApiUrl = `${environment.apiUrl}/auth`;

  private getInitialUser(): AdminUser | null {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getInitialToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);

    const payload = {
      usernameOrEmail: credentials.usernameOrEmail.trim(),
      password: credentials.password
    };

    return this.http.post<any>(`${this.authApiUrl}/login`, payload).pipe(
      map(res => {
        const rawUser = res?.user || res?.data || {};
        const role = String(rawUser.role || '');

        if (role !== 'ROLE_ADMIN' && role !== 'admin') {
          throw new Error('Access denied. Administrator privileges required.');
        }

        const adminUser: AdminUser = {
          id: rawUser.id || 1,
          username: rawUser.username || credentials.usernameOrEmail,
          email: rawUser.email || '',
          firstName: rawUser.firstName || 'Admin',
          lastName: rawUser.lastName || '',
          role: 'ROLE_ADMIN'
        };

        const token = res?.accessToken || res?.token;
        if (!token) {
          throw new Error('No authentication token returned from server.');
        }

        return {
          accessToken: token,
          tokenType: res?.tokenType || 'Bearer',
          expiresIn: res?.expiresIn,
          user: adminUser,
          message: res?.message || 'Authenticated successfully'
        };
      }),
      tap(authRes => {
        this.isLoading.set(false);
        this.saveSession(authRes.user, authRes.accessToken, credentials.rememberMe ?? true);
      }),
      catchError((err: any) => {
        this.isLoading.set(false);
        let errorMsg = 'Invalid username/email or password.';
        if (err.message && err.message.includes('Administrator privileges required')) {
          errorMsg = err.message;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 0) {
          errorMsg = 'Cannot connect to Spring Boot backend (http://localhost:8080). Please ensure server is running.';
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  public logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(user: AdminUser, token: string, remember: boolean): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);

    if (this.isBrowser) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
      storage.setItem(ADMIN_TOKEN_KEY, token);
    }
  }
}
