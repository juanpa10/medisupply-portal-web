import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section>
      <h1 class="text-2xl font-bold mb-4">Generar reporte de ventas</h1>

      <form [formGroup]="form" (ngSubmit)="generate()" class="bg-white p-4 rounded shadow max-w-3xl">
        <label class="block mb-2">Seleccionar criterio</label>
        <select formControlName="criterion" class="border p-2 rounded w-full mb-4">
          <option value="comercial">Comercial</option>
          <option value="product">Producto</option>
          <option value="region">Zona geográfica</option>
        </select>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-1">Fecha inicio</label>
            <input type="date" formControlName="start" class="border p-2 rounded w-full" />
          </div>
          <div>
            <label class="block mb-1">Fecha fin</label>
            <input type="date" formControlName="end" class="border p-2 rounded w-full" />
          </div>
        </div>

        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded" [disabled]="loading">Generar reporte</button>
      </form>

      <div *ngIf="report" class="mt-6 max-w-3xl">
        <div class="bg-white p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">Resumen</h2>
          <p><strong>Criterio:</strong> {{ report.criterion }}</p>
          <p><strong>Desde:</strong> {{ report.start }} — <strong>Hasta:</strong> {{ report.end }}</p>
          <p><strong>Total:</strong> {{ report.total }}</p>
          <p *ngIf="report.pct_change !== null"><strong>Variación %:</strong> {{ report.pct_change }}</p>
        </div>

        <div *ngIf="report.top5?.length" class="bg-white p-4 rounded shadow mt-4">
          <h3 class="font-semibold mb-2">Top 5</h3>
          <table class="w-full table-auto border-collapse">
            <thead>
              <tr class="text-left border-b"><th>Elemento</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of report.top5" class="border-b">
                <td class="py-2">{{ t.product || t.name || t.key }}</td>
                <td class="py-2">{{ t.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="report.daily?.length" class="bg-white p-4 rounded shadow mt-4">
          <h3 class="font-semibold mb-2">Diario</h3>

          <!-- Inline SVG chart -->
          <div class="mb-4 overflow-auto">
            <svg [attr.width]="chartWidth" [attr.height]="chartHeight" class="w-full h-auto" role="img" aria-label="Gráfico diario de ventas">
              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.6"></stop>
                  <stop offset="100%" stop-color="#60A5FA" stop-opacity="0.1"></stop>
                </linearGradient>
              </defs>

              <!-- area under curve -->
              <path *ngIf="svgAreaPath" [attr.d]="svgAreaPath" fill="url(#grad)" stroke="none"></path>
              <!-- line path -->
              <path *ngIf="svgLinePath" [attr.d]="svgLinePath" fill="none" stroke="#2563EB" stroke-width="2"></path>

              <!-- points -->
              <g *ngFor="let p of svgPoints">
                <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="#2563EB"></circle>
              </g>

              <!-- x labels (dates) -->
              <g *ngFor="let lbl of svgXLabels">
                <text [attr.x]="lbl.x" [attr.y]="chartHeight - 4" font-size="10" fill="#374151" text-anchor="middle">{{ lbl.text }}</text>
              </g>

              <!-- y labels -->
              <g *ngFor="let y of svgYLabels">
                <text x="6" [attr.y]="y.y" font-size="10" fill="#374151">{{ y.text }}</text>
                <line x1="30" [attr.x2]="chartWidth - 10" [attr.y1]="y.y" [attr.y2]="y.y" stroke="#E5E7EB" stroke-width="1"></line>
              </g>
            </svg>
          </div>

          <table class="w-full table-auto border-collapse text-sm">
            <thead>
              <tr class="text-left border-b"><th>Fecha</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of report.daily" class="border-b">
                <td class="py-2">{{ d.date }}</td>
                <td class="py-2">{{ d.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="error" class="mt-4 text-red-600">{{ error }}</div>
    </section>
  `
})
export class ReportsComponent implements OnInit {
  form: FormGroup;
  loading = false;
  report: any = null;
  error: string | null = null;
  // Chart-related
  chartWidth = 700;
  chartHeight = 220;
  svgLinePath: string | null = null;
  svgAreaPath: string | null = null;
  svgPoints: Array<{ x: number; y: number }> = [];
  svgXLabels: Array<{ x: number; text: string }> = [];
  svgYLabels: Array<{ y: number; text: string }> = [];

  constructor(private fb: FormBuilder, private reportsSvc: ReportsService) {
    this.form = this.fb.group({
      criterion: ['product', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required]
    });
  }

  private buildChartFromDaily() {
    const daily = (this.report && Array.isArray(this.report.daily)) ? this.report.daily : [];
    if (!daily || daily.length === 0) {
      this.svgLinePath = null;
      this.svgAreaPath = null;
      this.svgPoints = [];
      this.svgXLabels = [];
      this.svgYLabels = [];
      return;
    }

    const n = daily.length;
    // dynamic width so long series can scroll horizontally
    this.chartWidth = Math.max(600, n * 80);
    this.chartHeight = 220;

    const padLeft = 40;
    const padRight = 10;
    const padTop = 10;
    const padBottom = 30;

    const values = daily.map((d: any) => Number(d.total) || 0);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max === min) {
      // avoid zero range
      min = 0;
      if (max === 0) max = 1;
    }

    const plotW = this.chartWidth - padLeft - padRight;
    const plotH = this.chartHeight - padTop - padBottom;
    const xStep = n > 1 ? plotW / (n - 1) : 0;
    const scaleY = (max - min) > 0 ? plotH / (max - min) : 1;

    this.svgPoints = values.map((v: number, i: number) => {
      const x = padLeft + i * xStep;
      const y = padTop + (max - v) * scaleY;
      return { x, y };
    });

    // line path
    this.svgLinePath = this.svgPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

    // area path closed to baseline
    const baseY = padTop + plotH;
    const first = this.svgPoints[0];
    const last = this.svgPoints[this.svgPoints.length - 1];
    this.svgAreaPath = `${this.svgLinePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;

    // x labels: sample up to ~8 labels
    const maxLabels = 8;
    const step = Math.max(1, Math.ceil(n / maxLabels));
    this.svgXLabels = daily.map((d: any, i: number) => {
      if (i % step !== 0 && i !== n - 1) return null;
      const x = padLeft + i * xStep;
      // shorten date if necessary
      const txt = (d.date || '').toString();
      const short = txt.length > 10 ? txt.slice(5) : txt; // show MM-DD if long
      return { x, text: short };
    }).filter(Boolean) as any;

    // y labels: 4 ticks
    this.svgYLabels = [];
    const ticks = 4;
    for (let t = 0; t <= ticks; t++) {
      const val = min + (t * (max - min) / ticks);
      const y = padTop + (max - val) * scaleY;
      const text = Math.abs(val) >= 1000 ? Math.round(val).toString() : (Number.isInteger(val) ? val.toString() : val.toFixed(2));
      this.svgYLabels.push({ y, text });
    }
  }

  ngOnInit(): void {}

  generate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    // Map UI values to API expected criterion values
    const mapping: Record<string, string> = {
      'comercial': 'commercial',
      'product': 'product',
      'region': 'region'
    };

    const payload = {
      criterion: mapping[v.criterion] ?? v.criterion,
      start: v.start,
      end: v.end
    };

    this.loading = true;
    this.error = null;
    this.report = null;

    this.reportsSvc.generateReport(payload).subscribe({
      next: (res: any) => {
        this.report = res;
        this.loading = false;
        // build chart for daily series if present
        try {
          this.buildChartFromDaily();
        } catch (e) {
          console.warn('Failed to build chart', e);
          this.svgLinePath = null;
          this.svgAreaPath = null;
          this.svgPoints = [];
          this.svgXLabels = [];
          this.svgYLabels = [];
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Error al generar reporte';
        this.loading = false;
      }
    });
  }
}
