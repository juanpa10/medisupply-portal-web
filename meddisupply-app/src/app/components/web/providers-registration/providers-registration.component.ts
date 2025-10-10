import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

interface Provider {
  fecha: string;
  razonSocial: string;
  nit: string;
  representanteLegal: string;
  pais: string;
  nombreContacto: string;
  celular: string;
  certificado?: string;
}

@Component({
  selector: 'app-providers-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './providers-registration.component.html',
  styleUrls: ['./providers-registration.component.scss'],
})
export class ProvidersRegistrationComponent {
  form: FormGroup;

  providers: Provider[] = [
    {
      fecha: '2025-09-05 14:22',
      razonSocial: 'empresa01',
      nit: '123594142',
      representanteLegal: 'Representante Legal 01',
      pais: 'Colombia',
      nombreContacto: 'Contacto1',
      celular: '1234567890',
      certificado: 'factura_5821.pdf',
    },
    {
      fecha: '2025-09-05 12:03',
      razonSocial: 'empresa02',
      nit: '723595645',
      representanteLegal: 'Representante Legal 02',
      pais: 'Canada',
      nombreContacto: 'Contacto2',
      celular: '1234567890',
      certificado: 'foto_771.jpg',
    },
    {
      fecha: '2025-09-05 10:15',
      razonSocial: 'empresar01',
      nit: '923578143',
      representanteLegal: 'Representante Legal 03',
      pais: 'Honduras',
      nombreContacto: 'Contacto3',
      celular: '1234567890',
      certificado: 'ajuste.txt',
    },
  ];
  successMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      razonSocial: ['', Validators.required],
      nit: ['', Validators.required],
      representanteLegal: ['', Validators.required],
      pais: ['', Validators.required],
      nombreContacto: ['', Validators.required],
      celular: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      certificado: [''],
    });
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
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.form.patchValue({ certificado: file.name });
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value as any;
    const newProvider: Provider = {
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
      razonSocial: (value.razonSocial ?? '') as string,
      nit: (value.nit ?? '') as string,
      representanteLegal: (value.representanteLegal ?? '') as string,
      pais: (value.pais ?? '') as string,
      nombreContacto: (value.nombreContacto ?? '') as string,
      celular: (value.celular ?? '') as string,
      certificado: (value.certificado || undefined) as string | undefined,
    };
    this.providers = [newProvider, ...this.providers];
    this.form.reset();
    // Show a simulated confirmation message
    this.successMessage = 'Proveedor registrado correctamente.';
    setTimeout(() => (this.successMessage = null), 3000);
  }

  cancel() {
    this.form.reset();
  }
}
