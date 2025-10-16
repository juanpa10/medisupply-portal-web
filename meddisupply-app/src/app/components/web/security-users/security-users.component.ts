import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { RolesService } from '../../../services/roles.service';

@Component({
  selector: 'app-security-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Seguridad — Usuarios</h1>

      <div class="bg-white p-4 rounded shadow">
        <div *ngIf="loading" class="text-gray-500">Cargando usuarios...</div>
        <table *ngIf="!loading" class="min-w-full table-auto">
          <thead>
            <tr class="text-left text-sm text-gray-600">
              <th class="px-2 py-1">ID</th>
              <th class="px-2 py-1">Nombre</th>
              <th class="px-2 py-1">Email</th>
              <th class="px-2 py-1">Roles</th>
              <th class="px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users" class="border-t align-top">
              <td class="px-2 py-2 text-sm">{{ u.id }}</td>
              <td class="px-2 py-2 text-sm">{{ u.names }}</td>
              <td class="px-2 py-2 text-sm">{{ u.email }}</td>
              <td class="px-2 py-2 text-sm w-72">
                <div *ngIf="editingUserId !== u.id">{{ u.roles_names || '—' }}</div>

                <div *ngIf="editingUserId === u.id" class="space-y-2">
                  <div *ngFor="let r of availableRoles" class="flex items-center gap-2">
                    <input type="checkbox" [checked]="selections[u.id]?.has(r.id)" (change)="toggleRole(u.id, r.id, $event)" />
                    <label class="text-sm">{{ r.name }}</label>
                  </div>

                  <div class="flex items-center gap-2 mt-2">
                    <button class="px-3 py-1 bg-blue-600 text-white rounded" (click)="saveRoles(u)">{{ saving && editingUserId===u.id ? 'Guardando...' : 'Guardar' }}</button>
                    <button class="px-3 py-1 bg-gray-200 rounded" (click)="cancelEdit(u.id)">Cancelar</button>
                  </div>
                </div>
              </td>

              <td class="px-2 py-2 text-sm">
                <button *ngIf="editingUserId !== u.id" class="px-2 py-1 bg-indigo-600 text-white rounded" (click)="startEdit(u)">Editar roles</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && users.length===0" class="text-gray-600">No hay usuarios.</div>
      </div>
    </section>
  `
})
export class SecurityUsersComponent implements OnInit {
  private usersSvc = inject(UsersService);
  private rolesSvc = inject(RolesService);
  users: Array<any> = [];
  loading = true;

  // UI state for editing roles
  editingUserId: number | null = null;
  // fixed roles list as requested
  readonly availableRoles = [
    { id: 1, name: 'Compras' },
    { id: 2, name: 'Vendedor' },
    { id: 3, name: 'Clientes' },
    { id: 4, name: 'Logística' },
    { id: 5, name: 'Admin' }
  ];
  // selections map userId -> Set(roleId)
  selections: Record<number, Set<number>> = {};
  saving = false;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    // call the users-with-roles endpoint
    this.usersSvc.getUsersWithRoles().subscribe({
      next: (res) => {
        // backend returns an array in the example provided
        const data = Array.isArray(res) ? res : (res && (res as any).data) ? (res as any).data : [];
        this.users = Array.isArray(data) ? data : [];

        // normalize roles -> roles_names (comma separated names)
        this.users = this.users.map((u: any) => {
          const roles = u.roles || [];
          const names = Array.isArray(roles)
            ? roles.map((r: any) => (typeof r === 'string' ? r : (r && r.name) ? r.name : '')).filter(Boolean)
            : [];
          return { ...u, roles_names: names.join(', ') };
        });

        // prefill selections map from roles if present
        this.users.forEach((u: any) => {
          const roleIds = (u.roles || []).map((r: any) => (r && r.id) ? r.id : null).filter(Boolean) as number[];
          this.selections[u.id] = new Set<number>(roleIds);
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.users = [];
        this.loading = false;
      }
    });
  }

  startEdit(user: any) {
    this.editingUserId = user.id;
    // ensure selection entry exists
    if (!this.selections[user.id]) this.selections[user.id] = new Set<number>();
  }

  cancelEdit(userId: number) {
    // reset selection from existing user roles
    const u = this.users.find(x => x.id === userId);
    if (u) {
      const roleIds = (u.roles || []).map((r: any) => (r && r.id) ? r.id : null).filter(Boolean) as number[];
      this.selections[userId] = new Set<number>(roleIds);
    }
    this.editingUserId = null;
  }

  toggleRole(userId: number, roleId: number, event: any) {
    const set = this.selections[userId] || new Set<number>();
    if (event.target.checked) {
      set.add(roleId);
    } else {
      set.delete(roleId);
    }
    this.selections[userId] = set;
  }

  saveRoles(user: any) {
    const userId = user.id;
    const selected = Array.from(this.selections[userId] || []);
    // build assignments array using example defaults (can_view: true, others false)
    const assignments = selected.map(rid => ({ role_id: rid, can_create: false, can_edit: false, can_delete: false, can_view: true }));

    this.saving = true;
    this.rolesSvc.assignRolesToUser(userId, assignments).subscribe({
      next: (res) => {
        // update local UI: refresh list or update user's roles_names
        // For simplicity, refresh whole list
        this.saving = false;
        this.editingUserId = null;
        this.load();
      },
      error: (err) => {
        console.error('Failed to assign roles', err);
        this.saving = false;
        // keep in edit mode so user can retry
      }
    });
  }
}
