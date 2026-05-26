import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DashboardSummary } from './models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = 'http://localhost:5124/api';

  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/Dashboard/summary`);
  }
}
