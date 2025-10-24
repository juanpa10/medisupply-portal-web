import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagersService } from '../../../services/managers.service';
import { ClientsService } from '../../../services/clients.service';

@Component({
  selector: 'app-assign-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white p-6 rounded shadow">
        <h3 class="mb-3 font-semibold text-gray-700">Asignar Gerente de Cuenta</h3>

        <div class="mb-4">
          <select [(ngModel)]="selectedManagerId" class="w-full border rounded p-2 text-gray-600">
            <option [ngValue]="null">Seleccione un gerente...</option>
            <option *ngFor="let m of managers" [ngValue]="m?.id">{{ m?.name || m?.full_name || m?.email }}</option>
          </select>
        </div>

        <div class="mb-2">
          <button (click)="assign()" [disabled]="confirmLoading" class="bg-blue-600 text-white px-4 py-2 rounded">Asignar</button>
        </div>

        <div *ngIf="successMessage" class="text-green-600 mt-2">{{ successMessage }}</div>
      </div>

      <div class="bg-white p-6 rounded shadow">
        <h4 class="mb-3 font-semibold text-gray-700">Clientes</h4>
        <p class="text-sm text-gray-500 mb-4">Lista de clientes asociados al vendedor autenticado.</p>

        <table class="w-full table-auto text-left">
          <thead>
            <tr class="text-sm text-gray-600">
              <th class="p-2">Fecha</th>
              <th class="p-2">NIT</th>
              <th class="p-2">Razón social</th>
              <th class="p-2">Gerente Comercial</th>
              <th class="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of clients" class="border-t">
              <td class="p-2 text-sm">{{ c?.created_at | date:'shortDate' }}</td>
              <td class="p-2 text-sm">{{ c?.identifier || '-' }}</td>
              <td class="p-2 text-sm">{{ c?.name || c?.business_name || '-' }}</td>
              <td class="p-2 text-sm">{{ c?.manager?.full_name || '-' }}</td>
              <td class="p-2 text-sm">
                <button (click)="onAssignClient(c)" [disabled]="confirmLoading" class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Asignar</button>
                <button (click)="onChangeClient(c)" [disabled]="confirmLoading" class="bg-blue-300 text-white px-3 py-1 rounded">Cambiar</button>
              </td>
            </tr>
            <tr *ngIf="clients?.length === 0">
              <td class="p-4" colspan="5">No hay clientes para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <!-- Confirmation modal -->
      <div *ngIf="confirmVisible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div class="bg-white p-6 rounded shadow max-w-md w-full">
          <h3 class="font-semibold mb-2">Confirmación</h3>
          <p class="mb-4">{{ confirmMessage }}</p>
            <div class="flex justify-end gap-3">
            <button (click)="cancelConfirm()" [disabled]="confirmLoading" class="btn ghost">Cancelar</button>
            <button (click)="confirmAssign()" [disabled]="confirmLoading" class="btn primary">
              <svg *ngIf="confirmLoading" class="animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M22 12a10 10 0 0 1-10 10" /></svg>
              <span *ngIf="confirmLoading">Procesando...</span>
              <span *ngIf="!confirmLoading">Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AssignManagerComponent implements OnInit {
  managers: any[] = [];
  clients: any[] = [];
  selectedManagerId: number | null = null;
  successMessage = '';
  // confirmation modal state
  confirmVisible = false;
  confirmMessage = '';
  confirmClient: any = null;
  confirmHasManager = false;
  confirmLoading = false;

  constructor(private managersService: ManagersService, private clientsService: ClientsService) {}

  ngOnInit(): void {
    this.loadManagers();
    // Load all clients initially (or filtered by manager later)
    this.loadClients();
  }

  loadManagers() {
    this.managersService.getManagers().subscribe({
      next: (res: any) => {
        // Expecting array of managers
        this.managers = Array.isArray(res) ? res : (res?.data || res?.results || []);
      },
      error: (err: any) => console.warn('Failed to load managers', err)
    });
  }

  assign() {
    if (!this.selectedManagerId) return;
    // For now just show success and potentially load manager clients
    this.successMessage = 'Asignación exitosa';
    this.loadClientsForManager(this.selectedManagerId);
    setTimeout(() => this.successMessage = '', 4000);
  }

  loadClientsForManager(managerId: number | string) {
    // Prefer using ClientsService to fetch clients by manager
  this.clientsService.getClientsWithManager(Number(managerId)).subscribe({
      next: (res: any) => {
        this.clients = Array.isArray(res) ? res : (res?.data || res?.results || []);
      },
      error: (err: any) => {
        console.warn('Failed to load clients for manager', err);
        this.clients = [];
      }
    });
  }

  loadClients() {
  this.clientsService.getClientsWithManager().subscribe({
      next: (res: any) => {
        this.clients = Array.isArray(res) ? res : (res?.data || res?.results || []);
      },
      error: (err: any) => {
        console.warn('Failed to load clients', err);
        this.clients = [];
      }
    });
  }

  onAssignClient(client: any) {
    // Show confirmation modal and defer actual assignment to confirmAssign()
    this.showConfirm(client);
  }

  onChangeClient(client: any) {
    // Changing is equivalent to assign to selected manager
    this.showConfirm(client);
  }

  showConfirm(client: any) {
    if (!this.selectedManagerId) {
      console.warn('No manager selected for assignment');
      this.successMessage = 'Seleccione un gerente antes de asignar.';
      setTimeout(() => this.successMessage = '', 3000);
      return;
    }
    this.confirmClient = client;
    this.confirmHasManager = !!(client?.manager_id || client?.manager);
    this.confirmMessage = this.confirmHasManager
      ? 'El cliente ya tiene un gerente asignado. ¿Seguro que desea cambiar de gerente?'
      : '¿Seguro que desea asignar este cliente al gerente seleccionado?';
    this.confirmVisible = true;
  }

  cancelConfirm() {
    this.confirmVisible = false;
    this.confirmClient = null;
    this.confirmMessage = '';
  }

  confirmAssign() {
    if (!this.confirmClient || !this.selectedManagerId) {
      this.cancelConfirm();
      return;
    }
    this.confirmLoading = true;
    const client = this.confirmClient;
    const hasManager = this.confirmHasManager;
    const rawAuth = localStorage.getItem('meddisupply_auth');
    let operator = 'system';
    try {
      if (rawAuth) {
        const parsed = JSON.parse(rawAuth);
        operator = parsed?.email ?? parsed?.user?.email ?? operator;
      }
    } catch (e) {
      // ignore
    }

    const payload = {
      client_id: client?.id,
      operator,
      evidence: hasManager ? `Cambio desde UI` : `Asignado desde UI`
    };

    this.managersService.assignClient(this.selectedManagerId, payload).subscribe({
      next: (res: any) => {
        this.successMessage = hasManager ? 'Gerente cambiado correctamente.' : 'Cliente asignado correctamente.';
        this.cancelConfirm();
        // refresh clients for this manager
        this.loadClientsForManager(this.selectedManagerId as number);
        this.confirmLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        console.warn('assignClient failed', err);
        this.successMessage = hasManager ? 'No se pudo cambiar el gerente.' : 'No se pudo asignar el cliente.';
        this.confirmLoading = false;
        this.cancelConfirm();
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }
}
