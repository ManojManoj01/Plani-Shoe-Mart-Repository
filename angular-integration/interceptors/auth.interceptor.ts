import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthenticationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Attach JWT Access Token if available in memory
    const token = this.authService.getAccessToken();
    let authReq = request;

    if (token) {
      authReq = this.addTokenHeader(request, token);
    }

    // 2. Pass request and handle potential 401 Unauthorized errors
    return next.handle(authReq).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !authReq.url.includes('/api/auth/login') &&
          !authReq.url.includes('/api/auth/refresh')
        ) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Perform silent token refresh via HttpOnly cookie
      return this.authService.refreshToken().pipe(
        switchMap((authResponse) => {
          this.isRefreshing = false;
          if (authResponse && authResponse.accessToken) {
            this.refreshTokenSubject.next(authResponse.accessToken);
            return next.handle(this.addTokenHeader(request, authResponse.accessToken));
          }

          // Refresh token invalid or expired; perform local logout
          this.authService.logoutLocal();
          return throwError(() => new Error('Session expired. Please log in again.'));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logoutLocal();
          return throwError(() => err);
        })
      );
    }

    // If already refreshing, wait until new token is available in subject
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((jwt) => next.handle(this.addTokenHeader(request, jwt!)))
    );
  }
}
