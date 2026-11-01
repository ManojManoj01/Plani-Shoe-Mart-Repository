import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserSummaryDto,
} from '../models/stepstyle.models';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  // Secure token storage: Keep short-lived access token strictly in memory
  // NEVER store long-lived tokens in localStorage to prevent XSS exfiltration
  private accessToken: string | null = null;

  private currentUserSubject = new BehaviorSubject<UserSummaryDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && !!this.currentUserSubject.value;
  }

  public isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ROLE_ADMIN';
  }

  public register(request: RegisterRequest): Observable<ApiResponse<UserSummaryDto>> {
    return this.http.post<ApiResponse<UserSummaryDto>>(`${this.apiUrl}/register`, request);
  }

  public login(request: LoginRequest): Observable<AuthResponse> {
    // withCredentials: true ensures HttpOnly refresh cookie is received and stored by the browser
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.accessToken = response.accessToken;
          this.currentUserSubject.next(response.user);
        })
      );
  }

  public refreshToken(): Observable<AuthResponse | null> {
    // Browser automatically attaches HttpOnly refresh token cookie
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.accessToken = response.accessToken;
          this.currentUserSubject.next(response.user);
        }),
        catchError(() => {
          this.logoutLocal();
          return of(null);
        })
      );
  }

  public forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, request);
  }

  public resetPassword(request: ResetPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, request);
  }

  public logout(): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.logoutLocal();
        })
      );
  }

  public fetchCurrentUser(): Observable<UserSummaryDto> {
    return this.http.get<UserSummaryDto>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  public logoutLocal(): void {
    this.accessToken = null;
    this.currentUserSubject.next(null);
  }
}
