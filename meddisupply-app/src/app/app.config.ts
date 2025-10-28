import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ValueProvider, InjectionToken } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { API_BASE_URL } from './services/auth.service';
import { LoginWebComponent } from './components/auth/login-web/login-web.component';
import { NavbarComponent } from './components/navigation/navbar/navbar.component';
import { ProductManagementComponent } from './components/web/product-management/product-management.component';
import { PurchaseManagementComponent } from './components/web/purchase-management/purchase-management.component';
import { SalesClientsComponent } from './components/web/sales-clients/sales-clients.component';
import { LogisticsInventoryComponent } from './components/web/logistics-inventory/logistics-inventory.component';
import { InventorySearchUiComponent } from './components/web/inventory-search/inventory-search-ui.component';
import { SecurityAuditComponent } from './components/web/security-audit/security-audit.component';
import { SecurityUsersComponent } from './components/web/security-users/security-users.component';
import { ProvidersRegistrationComponent } from './components/web/providers-registration/providers-registration.component';
import { SellersRegistrationComponent } from './components/web/sellers-registration/sellers-registration.component';
import { UsersRegistrationComponent } from './components/web/users-registration/users-registration.component';
import { AssignManagerComponent } from './components/web/assign-manager/assign-manager.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginWebComponent },
  { path: 'users-registration', component: UsersRegistrationComponent },
  {
    path: 'app',
    component: NavbarComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'product-management' },
  { path: 'providers-registration', component: ProvidersRegistrationComponent },
    { path: 'sellers-registration', component: SellersRegistrationComponent },
      { path: 'product-management', component: ProductManagementComponent },
      { path: 'purchase-management', component: PurchaseManagementComponent },
  { path: 'assign-manager', component: AssignManagerComponent },
      { path: 'sales-clients', component: SalesClientsComponent },
  { path: 'logistics-inventory', component: InventorySearchUiComponent },
  { path: 'security-audit', component: SecurityUsersComponent },
      { path: 'security-users', component: SecurityUsersComponent }
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

// Provide API base URL token with a runtime-friendly default. You can override
// the global `window['APP_API_BASE']` before the app boots to change this.
export const apiBaseProvider: ValueProvider = {
  provide: API_BASE_URL,
  useValue: (typeof window !== 'undefined' && (window as any).APP_API_BASE) ? (window as any).APP_API_BASE : ''
};

// Note: to use the `AuthService` we need HttpClient available; importing providers
// from HttpClientModule here makes it available app-wide when using standalone bootstrapping.
export const appProviders = [
  importProvidersFrom(HttpClientModule),
  apiBaseProvider
];

// Register global HTTP interceptors (auth)
appProviders.push({ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } as any);
