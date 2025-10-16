import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SuppliersService } from '../../../services/suppliers.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
export class ProvidersRegistrationComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  loadingSuppliers = false;
  supplierLoadError: string | null = null;
  private selectedFile: File | null = null;

  providers: Provider[] = [];
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private suppliers: SuppliersService) {
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

  // Map backend field name to form control key
  private mapFieldToControl(field: string): string {
    const map: Record<string,string> = {
      razon_social: 'razonSocial',
      nit: 'nit',
      representante_legal: 'representanteLegal',
      nombre_contacto: 'nombreContacto',
      pais: 'pais',
      celular_contacto: 'celular',
      business_name: 'razonSocial',
      contact_name: 'nombreContacto',
      contact_phone: 'celular',
      country: 'pais',
      legal_representative: 'representanteLegal'
    };
    return map[field] ?? field;
  }

  // Translate some common English backend phrases into Spanish for UX
  private translateCommonPhrases(msg: string): string {
    const translations: Array<[RegExp, string]> = [
      [/^Ensure this field has at least (\d+) characters?\.$/i, 'Debe tener al menos $1 caracteres.'],
      [/^Ensure this field has no more than (\d+) characters?\.$/i, 'Debe tener como máximo $1 caracteres.'],
      [/^This field may not be blank\.$/i, 'No puede estar vacío.'],
      [/^This field is required\.$/i, 'Este campo es obligatorio.'],
      [/^Invalid value\.$/i, 'Valor inválido.']
    ];
    for (const [re, repl] of translations) {
      const m = msg.match(re);
      if (m) return repl.replace('$1', m[1]);
    }
    return msg;
  }

  ngOnInit() {
    this.loadSuppliers();
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
    this.selectedFile = file;
    this.form.patchValue({ certificado: file.name });
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value as any;
    this.loading = true;
    this.errorMessage = null;

    // Build multipart form-data using the backend's expected spanish keys
    const fd = new FormData();
    fd.append('razon_social', value.razonSocial);
    fd.append('nit', value.nit);
    fd.append('representante_legal', value.representanteLegal);
    fd.append('nombre_contacto', value.nombreContacto);
    fd.append('pais', value.pais);
    fd.append('celular_contacto', value.celular);
    // append file under both likely keys the backend might accept
    if (this.selectedFile) {
      fd.append('certificate_file', this.selectedFile, this.selectedFile.name);
      fd.append('certificado', this.selectedFile, this.selectedFile.name);
    }

    this.suppliers.createSupplier(fd).pipe(
      catchError(err => {
        const apiErr = err?.error;
        if (apiErr && apiErr.errors && typeof apiErr.errors === 'object') {
          const fieldMap: Record<string,string> = {
            razon_social: 'Razón social',
            nit: 'NIT',
            representante_legal: 'Representante legal',
            nombre_contacto: 'Nombre de contacto',
            pais: 'País',
            celular_contacto: 'Celular de contacto',
            business_name: 'Razón social',
            contact_name: 'Nombre de contacto',
            contact_phone: 'Celular de contacto',
            country: 'País',
            legal_representative: 'Representante legal'
          };

          const messageMap: Array<[RegExp, string]> = [
            [/^Length must be between (\d+) and (\d+)\.$/i, 'Longitud debe estar entre $1 y $2.'],
            [/^Ensure this field has at least (\d+) characters?\.$/i, 'Debe tener al menos $1 caracteres.'],
            [/^Ensure this field has no more than (\d+) characters?\.$/i, 'Debe tener como máximo $1 caracteres.'],
            [/^This field may not be blank\.$/i, 'No puede estar vacío.'],
            [/^This field is required\.$/i, 'Este campo es obligatorio.'],
            [/^Must be one of:\s*(.*)$/i, 'Debe ser uno de: $1']
          ];

          const parts: string[] = [];
          for (const key of Object.keys(apiErr.errors)) {
            const msgs = apiErr.errors[key];
            const label = fieldMap[key] ?? key;
            if (Array.isArray(msgs)) {
              const translated = msgs.map((m: string) => {
                for (const [re, repl] of messageMap) {
                  const match = m.match(re);
                  if (match) {
                    let out = repl;
                    for (let i = 1; i < match.length; i++) out = out.replace(`$${i}`, match[i]);
                    return out;
                  }
                }
                return this.translateCommonPhrases(m);
              });
              parts.push(`${label}: ${translated.join('; ')}`);
              // mark control as touched so validation UI appears
              const ctrlKey = this.mapFieldToControl(key);
              const ctrl = this.form.get(ctrlKey);
              if (ctrl) {
                ctrl.setErrors({ server: true });
                ctrl.markAsTouched();
              }
            } else {
              parts.push(`${label}: ${String(msgs)}`);
            }
          }
          this.errorMessage = parts.join(' | ');
        } else {
          this.errorMessage = (apiErr?.message) || 'Error al crear proveedor';
        }
        this.loading = false;
        return of(null);
      })
    ).subscribe(res => {
      this.loading = false;
      if (res) {
        // Re-fetch suppliers from the server to show authoritative data
        this.loadSuppliers();
        this.form.reset();
        this.selectedFile = null;
        this.successMessage = 'Proveedor registrado correctamente.';
        setTimeout(() => (this.successMessage = null), 3000);
      }
    });
  }

  cancel() {
    this.form.reset();
  }

  loadSuppliers() {
    this.loadingSuppliers = true;
    this.supplierLoadError = null;
    console.log('getSuppliers q');
    this.suppliers.getSuppliers().pipe(
      catchError(err => {
        this.supplierLoadError = 'No se pudo cargar la lista de proveedores.';
        this.loadingSuppliers = false;
        return of(null as any);
      })
    ).subscribe(res => {
      this.loadingSuppliers = false;
      if (res && Array.isArray(res.data)) {
        // Map server supplier objects into Provider[] shape
        this.providers = res.data.map((s: any) => ({
          // format created_at (ISO) into 'YYYY-MM-DD HH:MM' local representation
          fecha: s.created_at ? new Date(s.created_at).toLocaleString().replace(',', '') : new Date().toISOString().slice(0,16).replace('T',' '),
          razonSocial: s.razon_social ?? s.business_name ?? '',
          nit: s.nit ?? '',
          representanteLegal: s.representante_legal ?? '',
          pais: s.pais ?? s.country ?? '',
          nombreContacto: s.nombre_contacto ?? s.contact_name ?? '',
          celular: s.celular_contacto ?? s.contact_phone ?? '',
          certificado: s.certificate_filename ?? ''
        }));
      }
    });
  }
}
