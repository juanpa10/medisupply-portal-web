import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  login(email: string, password: string): Observable<any> {
    const url = `${this.baseUrl.replace(/\/+$/,'')}/auth/login`;
    const body: LoginPayload = { email, password };
    return this.http.post(url, body, { headers: { 'Content-Type': 'application/json' } });
  }
}
