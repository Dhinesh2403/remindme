// src/app/core/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { SocketService } from './socket.service';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  streak: number;
  completionRate: number;
  role: 'user' | 'admin';
  createdAt: string;
  notifPrefs?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private socketService = inject(SocketService);

  private readonly API = `${environment.apiUrl}/auth`;

  // ─── Angular Signals for reactive state ──────────────────────────────────
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isPremium = computed(() => this._currentUser()?.isPremium ?? false);

  // ─── Login ────────────────────────────────────────────────────────────────
  login(payload: LoginPayload): Observable<{ user: User; tokens: AuthTokens }> {
    this._isLoading.set(true);
    return this.http
      .post<{ user: User; tokens: AuthTokens }>(`${this.API}/login`, payload)
      .pipe(
        tap(({ user, tokens }) => {
          this.setSession(user, tokens);
          this._isLoading.set(false);
        }),
        catchError((err) => {
          this._isLoading.set(false);
          return throwError(() => err);
        })
      );
  }

  // ─── Register ─────────────────────────────────────────────────────────────
  register(
    payload: RegisterPayload
  ): Observable<{ user: User; tokens: AuthTokens }> {
    this._isLoading.set(true);
    return this.http
      .post<{ user: User; tokens: AuthTokens }>(
        `${this.API}/register`,
        payload
      )
      .pipe(
        tap(({ user, tokens }) => {
          this.setSession(user, tokens);
          this._isLoading.set(false);
        }),
        catchError((err) => {
          this._isLoading.set(false);
          return throwError(() => err);
        })
      );
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  googleLogin(idToken: string): Observable<{ user: User; tokens: AuthTokens }> {
    return this.http
      .post<{ user: User; tokens: AuthTokens }>(`${this.API}/google`, {
        idToken,
      })
      .pipe(tap(({ user, tokens }) => this.setSession(user, tokens)));
  }

  // ─── Refresh access token ─────────────────────────────────────────────────
  refreshAccessToken(
    refreshToken: string
  ): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API}/refresh`, { refreshToken });
  }

  // ─── Verify OTP ───────────────────────────────────────────────────────────
  verifyOtp(email: string, otp: string): Observable<{ verified: boolean }> {
    return this.http.post<{ verified: boolean }>(`${this.API}/verify-otp`, {
      email,
      otp,
    });
  }

  // ─── Forgot / Reset password ──────────────────────────────────────────────
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API}/forgot-password`,
      { email }
    );
  }

  resetPassword(
    token: string,
    password: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/reset-password`, {
      token,
      password,
    });
  }

  // ─── Get current user profile ─────────────────────────────────────────────
  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`).pipe(
      tap((user) => this._currentUser.set(user))
    );
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      // Fire and forget — don't wait for server response
      this.http
        .post(`${this.API}/logout`, { refreshToken })
        .subscribe({ error: () => {} });
    }

    this.tokenService.clearTokens();
    this._currentUser.set(null);
    this.socketService.disconnect();
    this.router.navigate(['/auth/login']);
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────
  private setSession(user: User, tokens: AuthTokens): void {
    this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
    this._currentUser.set(user);
    this.socketService.connect(tokens.accessToken);
    this.router.navigate(['/app/home']);
  }

  /**
   * Called on app boot to restore session from localStorage
   */
  restoreSession(): void {
    const accessToken = this.tokenService.getAccessToken();
    if (!accessToken) return;

    this.fetchCurrentUser().subscribe({
      next: (user) => {
        this._currentUser.set(user);
        this.socketService.connect(accessToken);
      },
      error: () => {
        // Token invalid or expired — clear and redirect
        this.tokenService.clearTokens();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
