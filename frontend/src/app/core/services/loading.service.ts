// src/app/core/services/loading.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count   = 0;
  readonly active = signal(false);

  show(): void { this.count++; this.active.set(true); }

  hide(): void {
    this.count = Math.max(this.count - 1, 0);
    if (this.count === 0) this.active.set(false);
  }
}
