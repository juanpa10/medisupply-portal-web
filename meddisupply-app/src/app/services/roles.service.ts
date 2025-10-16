import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './auth.service';

export interface RoleUserCreateResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  createRoleUser(payload: { names: string; email: string; password: string }): Observable<RoleUserCreateResponse> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/roles/api/users` : `/roles/api/users`;
    return this.http.post<RoleUserCreateResponse>(url, payload, { headers: { 'Content-Type': 'application/json' } });
  }

  assignRolesToUser(userId: number, assignments: Array<any>): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/roles/api/users/${userId}/roles-permissions` : `/roles/api/users/${userId}/roles-permissions`;
    return this.http.put<any>(url, { assignments }, { headers: { 'Content-Type': 'application/json' } });
  }
}
