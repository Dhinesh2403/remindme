// src/app/core/services/insights.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WeeklyDataPoint  { label: string; value: number }
export interface CategoryBreakdown {
  type: string; label: string; emoji: string;
  color: string; count: number; percentage: number;
}
export interface InsightsSummary {
  streak:             number;
  bestStreak:         number;
  completedTotal:     number;
  accountabilityRate: number;
  weeklyData:         WeeklyDataPoint[];
  categoryBreakdown:  CategoryBreakdown[];
}
export interface Achievement {
  id:        string;
  name:      string;
  emoji:     string;
  earned:    boolean;
  earnedAt?: string;
  progress:  number;
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/users/me/insights`;

  getSummary(): Observable<InsightsSummary> {
    return this.http.get<InsightsSummary>(this.BASE);
  }

  getAchievements(): Observable<{ data: Achievement[] }> {
    return this.http.get<{ data: Achievement[] }>(`${this.BASE}/achievements`);
  }
}
