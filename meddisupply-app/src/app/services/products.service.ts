import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post('inventory/api/v1/products', formData);
  }

  getProducts(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`inventory/api/v1/products?page=${page}&per_page=${perPage}`);
  }

  bulkUploadProducts(csvFile: File): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/csv'
    });

    return this.http.post('inventory/api/v1/products/bulk-upload', csvFile, { headers });
  }
}