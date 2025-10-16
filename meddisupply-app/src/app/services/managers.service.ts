import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ManagerCreateResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class ManagersService {
  private http = inject(HttpClient);

  createManager(payload: any): Observable<ManagerCreateResponse> {
    // Use proxy path to reach http://localhost:9005
    const url = `managers/api/v1/managers`;
    return this.http.post<ManagerCreateResponse>(url, payload);
  }

  // Fetch manager details (including clients) by manager email
  getManagerByEmail(email: string): Observable<any> {
    const encoded = encodeURIComponent(email || '');
    const url = `managers/api/v1/managers/by-email/${encoded}`;
    return this.http.get<any>(url);
  }

  // Assign a client to a manager
  assignClient(managerId: number | string, payload: any): Observable<any> {
    const url = `managers/api/v1/managers/${managerId}/assign`;
    return this.http.post<any>(url, payload);
  }
}
