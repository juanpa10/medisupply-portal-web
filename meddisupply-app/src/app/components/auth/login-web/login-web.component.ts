import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button.component';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login-web',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-lg shadow p-8">
        <div class="text-center mb-4">
          <img src="/assets/logo-login.png" alt="Logo" class="h-10 mx-auto" />
          <h2 class="mt-3 text-2xl font-semibold">Bienvenido</h2>
          <p class="text-sm text-gray-500">Inicia sesión para continuar en MediSupply</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700">Correo</label>
            <input formControlName="email" type="email" class="mt-1 block w-full border rounded p-2" placeholder="nombre@ejemplo.com" />
            <div *ngIf="form.controls['email'].invalid && form.controls['email'].touched" class="text-red-600 text-sm">
              Por favor ingresa un correo electrónico válido
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input formControlName="password" type="password" class="mt-1 block w-full border rounded p-2" placeholder="••••••••" />
            <div *ngIf="form.controls['password'].invalid && form.controls['password'].touched" class="text-red-600 text-sm">La contraseña es obligatoria</div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input type="checkbox" id="remember" class="mr-2" />
              <label for="remember" class="text-sm text-gray-600">Recuérdame</label>
            </div>
            <a class="text-sm text-blue-600" href="#">¿Olvidaste?</a>
          </div>

          <div *ngIf="error" class="text-red-600 text-sm">{{ error }}</div>

          <div>
            <app-button type="submit" [label]="loading ? 'Iniciando...' : 'Iniciar sesión'" [loading]="loading" [variant]="'primary'" [disabled]="form.invalid"></app-button>
          </div>
          <div class="text-center mt-4">
            <a routerLink="/users-registration" class="text-sm text-blue-600">¿Registrar nuevo usuario?</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginWebComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  private auth = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      this.error = null;
      const { email, password } = this.form.value;
      this.auth.login(email, password).pipe(
        finalize(() => this.loading = false),
        catchError((err) => {
          const msg = (err && err.error && err.error.message) ? err.error.message : 'Credenciales inválidas';
          this.error = msg;
          return of(null);
        })
      ).subscribe((res) => {
        if (res) {
          try {
            // If the API returns an access_token, persist it along with metadata
            if (res.access_token) {
              const auth = {
                access_token: res.access_token,
                expires_in: res.expires_in ?? null,
                role: res.role ?? null,
                email: res.email ?? email,
                token_type: res.token_type ?? null,
                received_at: Date.now()
              };
              localStorage.setItem('meddisupply_auth', JSON.stringify(auth));
            }
          } catch (e) {
            // ignore storage errors but log
            console.warn('Failed to save auth token', e);
          }

          this.router.navigate(['/app/product-management']);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
