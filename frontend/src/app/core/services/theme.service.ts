// src/app/core/services/theme.service.ts
import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _mode = signal<ThemeMode>('light');
  readonly mode = this._mode.asReadonly();

  apply(mode: ThemeMode): void {
    this._mode.set(mode);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark      = mode === 'dark' || (mode === 'system' && prefersDark);
    document.body.classList.toggle('dark-theme',  isDark);
    document.body.classList.toggle('light-theme', !isDark);
  }

  init(): void {
    const saved = (localStorage.getItem('rm_theme') as ThemeMode) ?? 'light';
    this.apply(saved);
  }
}
