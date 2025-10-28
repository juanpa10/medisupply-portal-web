import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-inventory-search',
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
        />
        <button class="btn btn-search" (click)="onSearch()">Buscar</button>
      </div>

      <div class="result-card" *ngIf="found">
        <p><strong>Ubicación del producto:</strong></p>
        <p>Pasillo: {{ found.pasillo }}</p>
        <p>Estantería: {{ found.estanteria }}</p>
        <p>Nivel: {{ found.nivel }}</p>
        <p class="note">Nota: Si el producto no existe en inventario, se mostrará un mensaje claro.</p>
      </div>

      <div class="result-empty" *ngIf="searched && !found">
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
    .btn-search:hover {
      background: #0b5ed7;
    }
    .result-card { margin-top: 18px; color: #333; }
    .result-card p { margin: 6px 0; }
    .note { color: #d9534f; margin-top: 12px; }
    .result-empty { margin-top: 18px; }
    .text-muted { color: #999; }
    `
  ]
})
export class InventorySearchComponent {
  query = '';
  searched = false;
  found: { pasillo: string; estanteria: number; nivel: number } | null = null;

  onSearch() {
    this.searched = true;
    // Placeholder behaviour: show a sample location so the UI can be reviewed.
    // The user will later provide the service to actually search the backend.
    if (!this.query || this.query.trim().length === 0) {
      this.found = null;
      return;
    }

    // Demo sample result to match the provided mockup.
    this.found = {
      pasillo: 'A3',
      estanteria: 2,
      nivel: 1
    };
    console.log('Buscar producto:', this.query);
  }
}
