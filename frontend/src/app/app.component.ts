// src/app/app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet }   from '@ionic/angular/standalone';
import { AuthService }    from './core/services/auth.service';
import { ThemeService }   from './core/services/theme.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector:    'app-root',
  standalone:  true,
  imports:     [IonApp, IonRouterOutlet],
  template:    `<ion-app><ion-router-outlet></ion-router-outlet></ion-app>`,
})
export class AppComponent implements OnInit {
  private authService         = inject(AuthService);
  private themeService        = inject(ThemeService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    // Restore theme preference
    this.themeService.init();

    // Restore auth session from stored tokens
    this.authService.restoreSession();

    // Load notifications after auth
    // (NotificationService subscribes to socket events automatically)
  }
}
