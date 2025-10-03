import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logistics-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Logística e inventario</h1>
      <div class="bg-white p-4 rounded shadow">Cuadrícula de inventario (placeholder)</div>
    </section>
  `
})
export class LogisticsInventoryComponent {}
