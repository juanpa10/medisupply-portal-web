import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { LoginWebComponent } from './components/auth/login-web/login-web.component';
import { NavbarComponent } from './components/navigation/navbar/navbar.component';
import { ProductManagementComponent } from './components/web/product-management/product-management.component';
import { PurchaseManagementComponent } from './components/web/purchase-management/purchase-management.component';
import { SalesClientsComponent } from './components/web/sales-clients/sales-clients.component';
import { LogisticsInventoryComponent } from './components/web/logistics-inventory/logistics-inventory.component';
import { SecurityAuditComponent } from './components/web/security-audit/security-audit.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginWebComponent },
  {
    path: 'app',
    component: NavbarComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'product-management' },
      { path: 'product-management', component: ProductManagementComponent },
      { path: 'purchase-management', component: PurchaseManagementComponent },
      { path: 'sales-clients', component: SalesClientsComponent },
      { path: 'logistics-inventory', component: LogisticsInventoryComponent },
      { path: 'security-audit', component: SecurityAuditComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
