import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SellersService } from '../../../services/sellers.service';
import { ManagersService } from '../../../services/managers.service';
import { ClientsService } from '../../../services/clients.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface ClientEntry {
  id?: number;
  created_at?: string;
  identifier?: string;
  name?: string;
}

@Component({
  selector: 'app-sellers-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sellers-registration.component.html',
  styleUrls: ['./sellers-registration.component.scss']
})
export class SellersRegistrationComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  clients: ClientEntry[] = [];
  successMessage: string | null = null;
  isVendorView = false;
  managerEmail: string | null = null;
  managerId: number | null = null;
  

  constructor(private fb: FormBuilder, private sellersSvc: SellersService, private managersSvc: ManagersService, private clientsSvc: ClientsService) {
    // Form focused on client creation: name (Razón social) and identifier (NIT) required; other fields optional
    this.form = this.fb.group({
      name: ['', Validators.required], // Razón social
      identifier: ['', Validators.required], // NIT
      // keep legacy seller fields optional in case they are used elsewhere
      correo: ['', [Validators.email]],
      direccion: [''],
      celular: ['', [Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngOnInit() {
    // determine if logged-in user is a Vendedor
    try {
      const raw = localStorage.getItem('meddisupply_auth');
      // Try to parse several shapes: JSON with email/role, or object with token, or JWT string
      const parsedAuth = this.parseAuthRaw(raw);
      const role = (parsedAuth?.role ?? '').toString().toLowerCase();
      const email = parsedAuth?.email ?? null;
      console.debug('sellers-registration: resolved auth -> role=', role, ' email=', email);
      if (role === 'vendedor' && email) {
        this.isVendorView = true;
        this.managerEmail = email;
        // fetch manager by email and populate clients list
        this.managersSvc.getManagerByEmail(email).pipe(
          catchError(() => of(null))
        ).subscribe((res: any | null) => {
          if (res) {
            // store manager id/email for later refreshes
            this.managerId = res.id ?? null;
            this.managerEmail = res.email ?? this.managerEmail;
            if (Array.isArray(res.clients)) {
              this.clients = res.clients.map((c: any) => ({ id: c.id, created_at: c.created_at, identifier: c.identifier, name: c.name }));
            }
          }
        });
      } else {
        // non-vendor view or unable to resolve vendor info: fallback
        console.debug('sellers-registration: non-vendor or no auth, loading clients via clientsSvc');
        this.loadClients();
      }
    } catch (e) {
      console.warn('Failed to read auth from localStorage', e);
      this.loadClients();
    }
  }

  // Helper: try to parse localStorage value and extract { email, role, token }
  private parseAuthRaw(raw: string | null): { email?: string | null; role?: string | null; token?: string | null } | null {
    if (!raw) return null;
    try {
      // If raw is JSON string
      if (raw.trim().startsWith('{')) {
        const parsed = JSON.parse(raw) as any;
        // If it's an object with access_token, maybe role is inside; return what we can
        const token = parsed?.access_token || parsed?.token || null;
        const email = parsed?.email ?? parsed?.user?.email ?? null;
        const role = parsed?.role ?? parsed?.user?.role ?? null;
        if (email || role) return { email, role, token };
        // If only token present, try decode
        if (token && typeof token === 'string') {
          const jwt = this.decodeJwt(token);
          if (jwt) return { email: jwt.email ?? jwt.sub ?? null, role: jwt.role ?? jwt.roles ?? jwt['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ?? null, token };
        }
        return { email: email ?? null, role: role ?? null, token };
      }
      // If raw is a string token (JWT), try decode
      if (raw.split('.').length === 3) {
        const jwt = this.decodeJwt(raw);
        if (jwt) return { email: jwt.email ?? jwt.sub ?? null, role: jwt.role ?? jwt.roles ?? null, token: raw };
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  private decodeJwt(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // base64url -> base64
      let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const json = atob(b64);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // convenience getter for template access
  get f() {
    return this.form.controls;
  }

  isInvalid(controlName: string) {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  onFileChange(event: Event) {
    // not used for clients
    return;
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
      name: v.name,
      identifier: v.identifier
    };

    this.clientsSvc.createClientObserve(payload).pipe(
      catchError(err => { this.errorMessage = err?.error?.message || 'Error al crear cliente'; this.loading = false; return of(null); })
    ).subscribe((resp: any | null) => {
      this.loading = false;
      if (resp && resp.status === 201) {
        this.successMessage = 'Cliente registrado correctamente.';
        this.form.reset();
        // extract created client id from response body
        const body = resp.body ?? {};
        const createdId = body?.data?.id ?? body?.id ?? body?.client_id ?? null;

        // after successful create, if we have managerId and createdId, call assign
        if (this.isVendorView && this.managerId && createdId) {
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

          const assignPayload = {
            client_id: createdId,
            operator,
            evidence: `Creado desde UI`
          };

          this.managersSvc.assignClient(this.managerId, assignPayload).pipe(
            catchError(err => { console.warn('Assign failed', err); return of(null); })
          ).subscribe((assignRes: any | null) => {
            // ignore body; refresh clients list afterwards
            this.managersSvc.getManagerByEmail(this.managerEmail || '').pipe(
              catchError(() => of(null))
            ).subscribe((mgrRes: any | null) => {
              if (mgrRes && Array.isArray(mgrRes.clients)) {
                this.clients = mgrRes.clients.map((c: any) => ({ id: c.id, created_at: c.created_at, identifier: c.identifier, name: c.name }));
              }
            });
          });
        } else {
          // refresh clients normally
          if (this.isVendorView && this.managerEmail) {
            this.managersSvc.getManagerByEmail(this.managerEmail).pipe(catchError(() => of(null))).subscribe((mgrRes: any | null) => {
              if (mgrRes && Array.isArray(mgrRes.clients)) {
                this.clients = mgrRes.clients.map((c: any) => ({ id: c.id, created_at: c.created_at, identifier: c.identifier, name: c.name }));
              }
            });
          } else {
            this.loadClients();
          }
        }

        setTimeout(() => this.successMessage = null, 3000);
      } else if (resp) {
        this.errorMessage = resp?.body?.message || 'No se pudo crear el cliente';
      }
    });
  }

  loadSellers() {
    // legacy method removed
  }

  loadClients() {
    // If vendor view, clients are fetched in ngOnInit via managersSvc
    // Otherwise, attempt to load public clients (via clientsSvc) if available
    // Default loader: non-vendor fallback. For vendors, callers should use managersSvc
    if (!this.isVendorView && this.clientsSvc.getClientsByManager) {
      this.clientsSvc.getClientsByManager(0).pipe(
        catchError(() => of(null))
      ).subscribe((res: any | null) => {
        if (res && Array.isArray(res.data)) {
          this.clients = res.data.map((c: any) => ({ id: c.id, created_at: c.created_at, identifier: c.identifier, name: c.name }));
        }
      });
    }
  }
}
