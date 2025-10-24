import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './auth.service';

export interface ManagerCreateResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class ManagersService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  createManager(payload: any): Observable<ManagerCreateResponse> {
  const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    // In production managers API lives under /managers
    const url = cleaned ? `${cleaned}/api/v1/managers` : `/api/v1/managers`;
    return this.http.post<ManagerCreateResponse>(url, payload);
  }

  // Fetch manager details (including clients) by manager email

getManagerByEmail(email: string): Observable<any> {
    const encoded = encodeURIComponent(email || '');
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/v1/managers/by-email/${email}` : `/api/v1/managers/by-email/${email}`;
    return this.http.get<any>(url);
  }
    //const params = new HttpParams().set('email', email || '');
    //return this.http.get<any>(url, { params });
  

  // Assign a client to a manager
  assignClient(managerId: number | string, payload: any): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/v1/managers/${managerId}/assign` : `/api/v1/managers/${managerId}/assign`;
    return this.http.post<any>(url, payload);
  }

  // Fetch list of managers
  getManagers(): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/v1/managers` : `/api/v1/managers`;
    return this.http.get<any>(url);
  }

  // Fetch manager by id
  getManagerById(id: number | string): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/v1/managers/${id}` : `/api/v1/managers/${id}`;
    return this.http.get<any>(url);
  }
}
