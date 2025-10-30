import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private http: HttpClient) {}

  generateReport(payload: { criterion: string; start: string; end: string }): Observable<any> {
    return this.http.post('/api/v1/reports', payload);
  }
}
