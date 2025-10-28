import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}

  /**
   * Search product in inventory by query string `q`.
   * Calls: GET /api/v1/inventory/search-product?q=...
   */
  searchProduct(q: string): Observable<any> {
    const params = new HttpParams().set('q', q);
    return this.http.get('/api/v1/inventory/search-product', { params });
  }
}
