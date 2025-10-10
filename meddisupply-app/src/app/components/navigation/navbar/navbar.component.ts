import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/assets/logo-login.png" alt="Logo" class="h-10 mx-auto" />

          <!--img src="/assets/logo.svg" alt="MediSupply" class="h-8 w-auto" /-->
          <span class="text-lg font-semibold">MediSupply</span>
        </div>

        <nav class="hidden md:flex space-x-4 items-center">
          <a routerLink="/app/providers-registration" class="text-sm hover:text-blue-600 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"></path></svg></span>Registrar proveedores</a>
          <a routerLink="/app/product-management" class="text-sm hover:text-blue-600 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 22a2 2 0 0 0 2 0l8-4.27A2 2 0 0 0 21 16z"></path></svg></span>Productos</a>
          <a routerLink="/app/purchase-management" class="text-sm hover:text-blue-600 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5v5"></path><circle cx="5.5" cy="18.5" r="1.5"></circle><circle cx="18.5" cy="18.5" r="1.5"></circle></svg></span>Compras</a>
          <a routerLink="/app/sales-clients" class="text-sm hover:text-blue-600 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"></path></svg></span>Ventas</a>
          <a routerLink="/app/logistics-inventory" class="text-sm hover:text-blue-600 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5v5"></path><circle cx="5.5" cy="18.5" r="1.5"></circle><circle cx="18.5" cy="18.5" r="1.5"></circle></svg></span>Logística</a>
          <a routerLink="/app/security-audit" class="text-sm hover:text-blue-600 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M12 2l8 4v4c0 5-3.4 9.7-8 11-4.6-1.3-8-6-8-11V6z"></path><path d="M9 12l2 2 4-4"></path></svg></span>Seguridad</a>
        </nav>

        <div class="flex items-center space-x-3">
          <span *ngIf="role" class="text-sm text-gray-600 mr-3">{{ role }}</span>
          <a routerLink="/login" class="text-sm text-gray-600">Cerrar sesión</a>
        </div>
      </div>
    </header>

    <div class="app-body flex flex-1">
      <aside class="w-64 bg-gray-50 border-r hidden md:block">
        <div class="p-4">
          <ul class="space-y-2">
            <li><a routerLink="/app/providers-registration" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"></path></svg></span>Registrar proveedores</a></li>
            <li><a routerLink="/app/product-management" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 22a2 2 0 0 0 2 0l8-4.27A2 2 0 0 0 21 16z"></path></svg></span>Gestión de productos</a></li>
            <li><a routerLink="/app/purchase-management" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5v5"></path><circle cx="5.5" cy="18.5" r="1.5"></circle><circle cx="18.5" cy="18.5" r="1.5"></circle></svg></span>Gestión de compras</a></li>
            <li><a routerLink="/app/sales-clients" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"></path></svg></span>Ventas y clientes</a></li>
            <li><a routerLink="/app/logistics-inventory" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5v5"></path><circle cx="5.5" cy="18.5" r="1.5"></circle><circle cx="18.5" cy="18.5" r="1.5"></circle></svg></span>Logística e inventario</a></li>
            <li><a routerLink="/app/security-audit" class="block p-2 rounded hover:bg-gray-100 flex items-center gap-2"><span class="icon inline"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display:inline-block; vertical-align:middle" aria-hidden="true"><path d="M12 2l8 4v4c0 5-3.4 9.7-8 11-4.6-1.3-8-6-8-11V6z"></path><path d="M9 12l2 2 4-4"></path></svg></span>Seguridad y auditoría</a></li>
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
export class NavbarComponent implements OnInit {
  role: string | null = null;

  ngOnInit() {
    try {
      const raw = localStorage.getItem('meddisupply_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.role = parsed?.role ?? null;
      }
    } catch (e) {
      console.warn('Failed to read auth from localStorage', e);
    }
  }
}
