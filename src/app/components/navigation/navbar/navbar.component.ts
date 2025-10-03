import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/assets/logo.png" alt="Logo" class="h-8 w-auto" />
          <span class="text-lg font-semibold">MeddiSupply</span>
        </div>

        <nav class="hidden md:flex space-x-4 items-center">
          <a routerLink="/app/product-management" class="text-sm hover:text-blue-600">Products</a>
          <a routerLink="/app/purchase-management" class="text-sm hover:text-blue-600">Purchases</a>
          <a routerLink="/app/sales-clients" class="text-sm hover:text-blue-600">Sales</a>
          <a routerLink="/app/logistics-inventory" class="text-sm hover:text-blue-600">Logistics</a>
          <a routerLink="/app/security-audit" class="text-sm hover:text-blue-600">Security</a>
        </nav>

        <div class="flex items-center space-x-3">
          <a routerLink="/login" class="text-sm text-gray-600">Logout</a>
        </div>
      </div>
    </header>

    <div class="app-body flex flex-1">
      <aside class="w-64 bg-gray-50 border-r hidden md:block">
        <div class="p-4">
          <ul class="space-y-2">
            <li><a routerLink="/app/product-management" class="block p-2 rounded hover:bg-gray-100">Product Management</a></li>
            <li><a routerLink="/app/purchase-management" class="block p-2 rounded hover:bg-gray-100">Purchase Management</a></li>
            <li><a routerLink="/app/sales-clients" class="block p-2 rounded hover:bg-gray-100">Sales & Clients</a></li>
            <li><a routerLink="/app/logistics-inventory" class="block p-2 rounded hover:bg-gray-100">Logistics & Inventory</a></li>
            <li><a routerLink="/app/security-audit" class="block p-2 rounded hover:bg-gray-100">Security & Audit</a></li>
          </ul>
        </div>
      </aside>

      <main class="flex-1 p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `:host { display: block; min-height: 100vh; }
    .container { max-width: 1200px; }
    `
  ]
})
export class NavbarComponent {}
