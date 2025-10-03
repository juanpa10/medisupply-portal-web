import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Gestión de productos</h1>
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <div class="bg-white p-4 rounded shadow">Lista de productos / tabla (placeholder)</div>
        </div>
        <div>
          <div class="bg-white p-4 rounded shadow">Filtros / Acciones</div>
        </div>
      </div>
    </section>
  `
})
export class ProductManagementComponent {}
