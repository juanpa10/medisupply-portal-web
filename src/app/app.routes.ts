import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-web/login-web.component').then(m => m.LoginWebComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./components/navigation/navbar/navbar.component').then(m => m.NavbarComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'product-management'
      },
      {
        path: 'product-management',
        loadComponent: () => import('./components/web/product-management/product-management.component').then(m => m.ProductManagementComponent)
      },
      {
        path: 'purchase-management',
        loadComponent: () => import('./components/web/purchase-management/purchase-management.component').then(m => m.PurchaseManagementComponent)
      },
      {
        path: 'sales-clients',
        loadComponent: () => import('./components/web/sales-clients/sales-clients.component').then(m => m.SalesClientsComponent)
      },
      {
        path: 'logistics-inventory',
        loadComponent: () => import('./components/web/logistics-inventory/logistics-inventory.component').then(m => m.LogisticsInventoryComponent)
      },
      {
        path: 'security-audit',
        loadComponent: () => import('./components/web/security-audit/security-audit.component').then(m => m.SecurityAuditComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
