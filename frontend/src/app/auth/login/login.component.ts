// src/app/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonText,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
    IonText,
  ],
  template: `
    <ion-content class="login-content">
      <div class="login-bg">
        <div class="login-card">

          <!-- Logo -->
          <div class="login-logo">
            <ion-icon name="notifications" style="font-size:32px;color:white"></ion-icon>
          </div>

          <h1 class="login-title">Welcome Back</h1>
          <p class="login-sub">Sign in to never miss a reminder</p>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="input-wrap">
                <ion-icon name="mail-outline" class="input-icon"></ion-icon>
                <input
                  formControlName="email"
                  type="email"
                  class="form-input"
                  placeholder="your@email.com"
                  autocomplete="email"
                />
              </div>
              @if (email.invalid && email.touched) {
                <span class="field-error">Enter a valid email</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap">
                <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
                <input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="togglePassword()"
                >
                  <ion-icon
                    [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"
                  ></ion-icon>
                </button>
              </div>
              @if (password.invalid && password.touched) {
                <span class="field-error">Password must be at least 8 characters</span>
              }
            </div>

            <div class="forgot-link">
              <a routerLink="/auth/forgot-password">Forgot password?</a>
            </div>

            <button
              type="submit"
              class="btn-primary"
              [disabled]="form.invalid || isLoading()"
            >
              @if (isLoading()) {
                <ion-spinner name="crescent" style="width:18px;height:18px;color:white"></ion-spinner>
              } @else {
                Sign In
              }
            </button>

          </form>

          <div class="divider"><span>Or continue with</span></div>

          <button class="btn-google" (click)="onGoogleLogin()" [disabled]="isLoading()">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p class="login-footer">
            Don't have an account?
            <a routerLink="/auth/register">Sign up</a>
          </p>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content { --background: linear-gradient(160deg, #F0ECFF 0%, #E8F0FF 100%); }
    .login-bg { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 32px 20px; }
    .login-card { background: white; border-radius: var(--rm-radius-xl); padding: 36px 24px; width: 100%; max-width: 340px; box-shadow: var(--rm-shadow-md); }
    .login-logo { width: 64px; height: 64px; background: var(--rm-purple); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(124,58,237,0.3); }
    .login-title { font-size: 26px; font-weight: 800; color: var(--rm-purple); text-align: center; margin-bottom: 6px; }
    .login-sub { color: var(--rm-text-secondary); text-align: center; font-size: 14px; margin-bottom: 28px; }
    .form-group { margin-bottom: 16px; }
    .form-label { font-size: 13px; font-weight: 600; color: var(--rm-text-primary); display: block; margin-bottom: 6px; }
    .input-wrap { position: relative; }
    .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--rm-text-muted); z-index: 1; }
    .form-input { width: 100%; padding: 14px 16px 14px 44px; border: 1.5px solid var(--rm-border); border-radius: var(--rm-radius-md); font-size: 14px; outline: none; background: #F9FAFB; transition: border-color 0.2s; font-family: inherit; }
    .form-input:focus { border-color: var(--rm-purple); background: white; }
    .password-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--rm-text-muted); font-size: 18px; padding: 0; display: flex; }
    .field-error { font-size: 12px; color: var(--rm-danger); margin-top: 4px; display: block; }
    .forgot-link { text-align: right; margin-bottom: 16px; }
    .forgot-link a { font-size: 13px; color: var(--rm-purple); font-weight: 600; text-decoration: none; }
    .btn-primary { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--rm-purple) 0%, #9333EA 100%); color: white; border: none; border-radius: var(--rm-radius-md); font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(124,58,237,0.35); display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; transition: opacity 0.2s; }
    .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
    .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--rm-border); }
    .divider span { color: var(--rm-text-muted); font-size: 13px; white-space: nowrap; }
    .btn-google { width: 100%; padding: 14px; background: white; border: 1.5px solid var(--rm-border); border-radius: var(--rm-radius-md); font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--rm-text-primary); margin-bottom: 20px; font-family: inherit; }
    .login-footer { text-align: center; font-size: 13px; color: var(--rm-text-secondary); }
    .login-footer a { color: var(--rm-purple); font-weight: 700; text-decoration: none; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);

  readonly isLoading = this.authService.isLoading;
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get email(): AbstractControl { return this.form.get('email')!; }
  get password(): AbstractControl { return this.form.get('password')!; }

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, logoGoogle });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      error: async (err) => {
        const toast = await this.toastCtrl.create({
          message: err?.error?.message || 'Login failed. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        await toast.present();
      },
    });
  }

  onGoogleLogin(): void {
    // Trigger Google Identity Services (GIS) flow
    // Implementation: load GIS script → get idToken → call authService.googleLogin()
    console.log('Google OAuth flow triggered');
  }
}
