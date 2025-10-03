import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-clients',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Ventas y clientes</h1>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded shadow">Gráfico de ventas (placeholder)</div>
        <div class="bg-white p-4 rounded shadow">Lista de clientes (placeholder)</div>
      </div>
    </section>
  `
})
export class SalesClientsComponent {}
