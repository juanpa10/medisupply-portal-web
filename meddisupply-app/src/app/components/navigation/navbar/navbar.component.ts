import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, IconComponent],
  template: `
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/assets/logo.svg" alt="MeddiSupply" class="h-8 w-auto" />
          <span class="text-lg font-semibold">MeddiSupply</span>
        </div>

        <nav class="hidden md:flex space-x-4 items-center">
          <a routerLink="/app/product-management" class="text-sm hover:text-blue-600 flex items-center gap-2"><app-icon name="box" size="16"></app-icon>Productos</a>
          <a routerLink="/app/purchase-management" class="text-sm hover:text-blue-600 flex items-center gap-2"><app-icon name="shopping-cart" size="16"></app-icon>Compras</a>
          <a routerLink="/app/sales-clients" class="text-sm hover:text-blue-600 flex items-center gap-2"><app-icon name="trending-up" size="16"></app-icon>Ventas</a>
          <a routerLink="/app/logistics-inventory" class="text-sm hover:text-blue-600 flex items-center gap-2"><app-icon name="truck" size="16"></app-icon>Logística</a>
          <a routerLink="/app/security-audit" class="text-sm hover:text-blue-600 flex items-center gap-2"><app-icon name="shield-check" size="16"></app-icon>Seguridad</a>
        </nav>

        <div class="flex items-center space-x-3">
          <a routerLink="/login" class="text-sm text-gray-600">Cerrar sesión</a>
        </div>
      </div>
    </header>

    <div class="app-body flex flex-1">
      <aside class="w-64 bg-gray-50 border-r hidden md:block">
        <div class="p-4">
          <ul class="space-y-2">
            <li><a routerLink="/app/product-management" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><app-icon name="box" size="16"></app-icon>Gestión de productos</a></li>
            <li><a routerLink="/app/purchase-management" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><app-icon name="shopping-cart" size="16"></app-icon>Gestión de compras</a></li>
            <li><a routerLink="/app/sales-clients" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><app-icon name="trending-up" size="16"></app-icon>Ventas y clientes</a></li>
            <li><a routerLink="/app/logistics-inventory" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><app-icon name="truck" size="16"></app-icon>Logística e inventario</a></li>
            <li><a routerLink="/app/security-audit" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><app-icon name="shield-check" size="16"></app-icon>Seguridad y auditoría</a></li>
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
