import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

export interface ClientCreateResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);

  createClient(payload: any): Observable<ClientCreateResponse> {
    const url = `managers/api/v1/clients`;
    return this.http.post<ClientCreateResponse>(url, payload);
  }

  // create client and observe full response (status, headers, body)
  createClientObserve(payload: any): Observable<HttpResponse<any>> {
    const url = `managers/api/v1/clients`;
    return this.http.post<any>(url, payload, { observe: 'response' as const });
  }

  // Optional helper: fetch clients by manager id
  getClientsByManager(managerId: number): Observable<any> {
    const url = `managers/api/v1/clients`;
    let params = new HttpParams();
    if (managerId) params = params.set('manager_id', String(managerId));
    return this.http.get<any>(url, { params });
  }
}
