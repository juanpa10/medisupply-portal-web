import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Seguridad y auditoría</h1>
      <div class="bg-white p-4 rounded shadow">Registros de auditoría (placeholder)</div>
    </section>
  `
})
export class SecurityAuditComponent {}
