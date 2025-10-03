import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-login-web',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-lg shadow p-8">
        <div class="text-center mb-4">
          <img src="/assets/logo.svg" alt="Logo" class="h-10 mx-auto" />
          <h2 class="mt-3 text-2xl font-semibold">Bienvenido</h2>
          <p class="text-sm text-gray-500">Inicia sesión para continuar en MeddiSupply</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input formControlName="email" type="email" class="mt-1 block w-full border rounded p-2" placeholder="you@example.com" />
            <div *ngIf="form.controls['email'].invalid && form.controls['email'].touched" class="text-red-600 text-sm">Por favor ingresa un correo válido</div>
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

          <div>
            <app-button type="submit" [label]="loading ? 'Iniciando...' : 'Iniciar sesión'" [loading]="loading" [variant]="'primary'" [disabled]="form.invalid"></app-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginWebComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      // Allow any email/password as long as email is valid and password present
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/app/product-management']);
      }, 700);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
