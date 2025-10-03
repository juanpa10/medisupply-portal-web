import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Purchase Management</h1>
      <div class="bg-white p-4 rounded shadow">Purchase dashboard placeholder</div>
    </section>
  `
})
export class PurchaseManagementComponent {}
