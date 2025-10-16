import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './auth.service';

export interface SupplierCreateResponse {
  status: string;
  code: number;
  message: string;
  data: any;
}

export interface SupplierListResponse {
  status: string;
  code: number;
  message: string;
  data: Array<any>;
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  getSuppliers(filters?: { country?: string; business_name?: string }): Observable<SupplierListResponse> {
  const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
  const url = cleaned ? `${cleaned}/crm/api/v1/suppliers` : `/crm/api/v1/suppliers`;
    let params = new HttpParams();
    if (filters?.country) params = params.set('country', filters.country);
    if (filters?.business_name) params = params.set('business_name', filters.business_name);
    return this.http.get<SupplierListResponse>(url, { params });
  }

  createSupplier(formData: FormData): Observable<SupplierCreateResponse> {
    const cleaned = (this.baseUrl || '').replace(/\/+$/, '');
    const url = cleaned ? `${cleaned}/crm/api/v1/suppliers` : `/crm/api/v1/suppliers`;
    return this.http.post<SupplierCreateResponse>(url, formData);
  }
}
