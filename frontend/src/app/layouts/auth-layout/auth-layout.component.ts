// src/app/layouts/auth-layout/auth-layout.component.ts
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector:   'app-auth-layout',
  standalone: true,
  imports:    [IonApp, IonRouterOutlet],
  template:   `<ion-router-outlet></ion-router-outlet>`,
})
export class AuthLayoutComponent {}
