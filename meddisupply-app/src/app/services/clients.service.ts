import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { API_BASE_URL } from './auth.service';

export interface ClientCreateResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  createClient(payload: any): Observable<ClientCreateResponse> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/managers/api/v1/clients` : `/managers/api/v1/clients`;
    return this.http.post<ClientCreateResponse>(url, payload);
  }

  // create client and observe full response (status, headers, body)
  createClientObserve(payload: any): Observable<HttpResponse<any>> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/managers/api/v1/clients` : `/managers/api/v1/clients`;
    return this.http.post<any>(url, payload, { observe: 'response' as const });
  }

  // Original helper: fetch clients by manager id from managers service
  getClientsByManager(managerId?: number): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/managers/api/v1/clients` : `/managers/api/v1/clients`;
    let params = new HttpParams();
    if (managerId) params = params.set('manager_id', String(managerId));
    return this.http.get<any>(url, { params });
  }

  // New helper: fetch clients along with manager info from the consolidated API
  getClientsWithManager(managerId?: number): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/v1/clients-with-manager` : `/api/v1/clients-with-manager`;
    let params = new HttpParams();
    if (managerId) params = params.set('manager_id', String(managerId));
    return this.http.get<any>(url, { params });
  }
}
