import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  standalone: true,
  selector: 'app-inventory-search-ui',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-content">
    <div class="container-card">
      <h3 class="title">Buscar Producto en Bodega</h3>

      <div class="search-row">
        <input
          type="text"
          [(ngModel)]="query"
          class="search-input"
          placeholder="Buscar producto por nombre, código, o referencia"
          (keyup.enter)="onSearch()"
        />
        <button class="btn btn-search" (click)="onSearch()">Buscar</button>
      </div>

      <div class="result-card" *ngIf="results && results.length > 0">
        <p><strong>Ubicación del producto:</strong></p>
        <div *ngFor="let r of results" class="result-row">
          <div class="product-name"><strong>{{ r.product_info?.nombre }} ({{ r.product_info?.codigo }})</strong></div>
          <div class="product-details">Cantidad: {{ r.cantidad }} — {{ r.ubicacion }}</div>
        </div>
        <p class="note">{{ message }}</p>
      </div>

      <div class="result-empty" *ngIf="searched && (!results || results.length === 0)">
        <p class="text-muted">No se encontró el producto en bodega.</p>
      </div>
    </div>
  </div>
  `,
  styles: [
    `
    .page-content { padding: 24px; }
    .container-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      max-width: 980px;
      margin: 0 auto;
    }
    .title { margin: 0 0 12px 0; font-weight: 600; }
    .search-row { display: flex; gap: 12px; align-items: center; }
    .search-input {
      flex: 1;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #e6e6e6;
      outline: none;
      font-size: 14px;
    }
    .btn-search {
      background: #0d6efd; /* primary blue */
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 120ms ease-in-out;
    }
    .btn-search:hover { background: #0b5ed7; }
    .result-card { margin-top: 18px; color: #333; }
    .result-row { margin-bottom: 12px; }
    .product-name { font-size: 15px; }
    .product-details { color: #555; }
    .note { color: #6c757d; margin-top: 12px; }
    .result-empty { margin-top: 18px; }
    .text-muted { color: #999; }
    `
  ]
})
export class InventorySearchUiComponent {
  query = '';
  searched = false;
  results: any[] = [];
  message = '';

  constructor(private inventorySvc: InventoryService) {}

  onSearch() {
    const q = (this.query || '').trim();
    this.searched = true;
    this.results = [];
    this.message = '';
    if (!q) return;

    this.inventorySvc.searchProduct(q).subscribe(
      (res: any) => {
        this.results = res?.data || [];
        this.message = res?.message || '';
      },
      (err) => {
        console.error('Inventory search failed', err);
        this.results = [];
        this.message = 'Error buscando inventario';
      }
    );
  }
}
