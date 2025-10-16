import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './auth.service';

export interface SellerCreateResponse {
  status: string;
  code: number;
  message: string;
  data: any;
}

export interface SellerListResponse {
  status: string;
  code: number;
  message: string;
  data: Array<any>;
}

@Injectable({ providedIn: 'root' })
export class SellersService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  getSellers(filters?: { country?: string; name?: string }): Observable<SellerListResponse> {
    const url = `${this.baseUrl.replace(/\/+$/,'')}/api/sellers`;
    let params = new HttpParams();
    if (filters?.country) params = params.set('country', filters.country);
    if (filters?.name) params = params.set('name', filters.name);
    return this.http.get<SellerListResponse>(url, { params });
  }

  createSeller(formData: FormData): Observable<SellerCreateResponse> {
    const url = `${this.baseUrl.replace(/\/+$/,'')}/api/v1/sellers`;
    return this.http.post<SellerCreateResponse>(url, formData);
  }
}
