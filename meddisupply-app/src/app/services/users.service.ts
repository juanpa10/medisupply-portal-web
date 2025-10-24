import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './auth.service';

export interface UserCreateResponse {
  status: string;
  code: number;
  message: string;
  data: any;
}

export interface UserListResponse {
  status: string;
  code: number;
  message: string;
  data: Array<any>;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  getUsers(filters?: { role?: string }): Observable<UserListResponse> {
    // Prefer proxy-friendly relative path when API_BASE_URL is not set.
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/v1/users` : `/api/v1/users`;
    let params = new HttpParams();
    if (filters?.role) params = params.set('role', filters.role);
    return this.http.get<UserListResponse>(url, { params });
  }

  // Some backends expose a users-with-roles endpoint (no v1); provide a helper for that path
  getUsersWithRoles(): Observable<any> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/api/users-with-roles` : `/api/users-with-roles`;
    return this.http.get<any>(url);
  }

  createUser(payload: any): Observable<UserCreateResponse> {
    // Use the auth proxy path to avoid CORS; dev server proxy forwards /auth to the auth host
    const url = `/auth/users`;
    return this.http.post<UserCreateResponse>(url, payload);
  }
}
