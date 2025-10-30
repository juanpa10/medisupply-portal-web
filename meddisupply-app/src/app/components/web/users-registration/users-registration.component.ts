import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { ManagersService } from '../../../services/managers.service';
import { RolesService } from '../../../services/roles.service';
import { RouterModule, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface UserEntry {
  fecha: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  role: string;
}

@Component({
  selector: 'app-users-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './users-registration.component.html',
  styleUrls: ['./users-registration.component.scss']
})
export class UsersRegistrationComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private usersSvc: UsersService, private managersSvc: ManagersService, private rolesSvc: RolesService, private router: Router) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      idNumber: ['', Validators.required],
      role: ['Vendedor', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    // Add group-level validator to ensure password and confirmPassword match
    this.form.setValidators(this.passwordsMatchValidator as any);
  }

  ngOnInit() {
    // nothing to load for now
  }

  // convenience getter for template
  get f() {
    return this.form.controls;
  }

  isInvalid(controlName: string) {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  // group validator: return error object when passwords mismatch
  passwordsMatchValidator(control: import('@angular/forms').AbstractControl) {
    const group = control as FormGroup;
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
  }

  // helper used by template to show mismatch error on confirmPassword
  passwordsDoNotMatch() {
    return !!(this.form.errors && (this.form.errors as any).passwordsMismatch && (this.f['confirmPassword'].touched || this.f['confirmPassword'].dirty));
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value as any;
    this.loading = true;
    this.errorMessage = null;
    const payload = {
      names: v.fullName,
      email: v.email,
      password: v.password,
      role: v.role,
      phone: v.phone,
      id_number: v.idNumber
    };

    this.usersSvc.createUser(payload).pipe(
      catchError(err => { this.errorMessage = err?.error?.message || 'Error al crear usuario'; this.loading = false; return of(null); })
    ).subscribe(res => {
      if (!res) return; // error already handled in catchError

      const created = res.data ?? null;

      // If role is Vendedor, synchronously create manager record before redirecting
      // After user creation, also call roles service to create roles record in roles API
      const rolePayload = {
        names: payload.names,
        email: payload.email,
        password: payload.password
      };

      // Create roles entry in the roles service and then assign roles to the created role-user
      this.rolesSvc.createRoleUser(rolePayload).pipe(
        catchError(err => { console.warn('roles create failed', err); return of(null); })
      ).subscribe((roleRes: any | null) => {
        try {
          const createdRoleUser = roleRes?.data ?? roleRes ?? null;
          const roleUserId = createdRoleUser?.id ?? null;
          if (roleUserId) {
            // Map common role names to role IDs used by the security UI (same mapping as SecurityUsersComponent)
            const roleNameToId: Record<string, number> = {
              'compras': 1,
              'Vendedor': 2,
              'Cliente': 3,
              'Logística': 4,
              'admin': 5
            };

            const roleKey = (payload.role || '').toString().toLowerCase();
            const roleId = roleNameToId[roleKey] ?? null;

            // Build assignments array following the shape used by the security users component
            const assignments = roleId ? [
              { role_id: roleId, can_create: false, can_edit: false, can_delete: false, can_view: true }
            ] : [];

            if (assignments.length > 0) {
              this.rolesSvc.assignRolesToUser(roleUserId, assignments).pipe(
                catchError(err => { console.warn('assignRolesToUser failed', err); return of(null); })
              ).subscribe(() => {
                // assignment completed (or failed silently)
              });
            } else {
              console.warn('No role mapping found for role:', payload.role);
            }
          }
        } catch (err) {
          console.warn('Failed to process role creation response', err);
        }
      });

      if (payload.role === 'Vendedor') {
        const managerPayload = {
          full_name: payload.names,
          email: payload.email,
          phone: payload.phone,
          identification: payload.id_number,
          operator: 'system'
        };

        this.managersSvc.createManager(managerPayload).pipe(
          catchError(err => { this.errorMessage = err?.error?.message || 'Error al crear manager'; this.loading = false; return of(null); })
        ).subscribe(mres => {
          this.loading = false;
          if (!mres) return; // manager creation failed; error set above

          // both user and manager created successfully
          this.successMessage = 'Usuario y vendedor registrados correctamente.';
          // reset form but don't prefill passwords
          this.form.reset({ role: 'Vendedor' });
          // keep success message visible a bit longer so user sees it before redirect
          setTimeout(() => (this.successMessage = null), 3000);
          setTimeout(() => { try { this.router.navigate(['/login']); } catch (e) { /* ignore navigation error */ } }, 3500);
        });
      } else {
        // Not a vendor — just finish
        this.loading = false;
  this.successMessage = 'Usuario registrado correctamente.';
  // reset form but don't prefill passwords
  this.form.reset({ role: 'Vendedor' });
  // keep success message visible a bit longer so user sees it before redirect
  setTimeout(() => (this.successMessage = null), 3000);
  setTimeout(() => { try { this.router.navigate(['/login']); } catch (e) { /* ignore navigation error */ } }, 3500);
      }
    });
  }
}
