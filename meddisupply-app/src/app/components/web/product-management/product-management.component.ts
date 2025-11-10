import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  unidad_medida_id: string;
  proveedor_id: string;
  precio_compra: string;
  precio_venta: string;
  codigo: string;
  requiere_ficha_tecnica: boolean;
  requiere_condiciones_almacenamiento: boolean;
  requiere_certificaciones_sanitarias: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="products-page">
      <div class="content">
        <section class="card form-card">
          <h3>Registro de productos</h3>
          <p class="muted">Registra los productos: todos los campos quedan en auditoría.</p>

          <div *ngIf="successMessage" class="alert success">{{ successMessage }}</div>
          <div *ngIf="errorMessage" class="alert error">{{ errorMessage }}</div>
          <div *ngIf="loading" class="muted">Procesando... por favor espere.</div>

          <form [formGroup]="form" (ngSubmit)="register()" class="grid">
            <div class="col">
              <label>Nombre del producto *</label>
              <input formControlName="nombre" placeholder="Ingrese nombre del producto..." [class.invalid]="isInvalid('nombre')" />
              <div class="error" *ngIf="isInvalid('nombre')">El nombre del producto es obligatorio.</div>

              <label>Descripción *</label>
              <textarea formControlName="descripcion" placeholder="Ingrese descripción del producto..." [class.invalid]="isInvalid('descripcion')"></textarea>
              <div class="error" *ngIf="isInvalid('descripcion')">La descripción es obligatoria.</div>

              <label>Código *</label>
              <input formControlName="codigo" placeholder="Ingrese código del producto..." [class.invalid]="isInvalid('codigo')" />
              <div class="error" *ngIf="isInvalid('codigo')">El código es obligatorio.</div>

              <label>Categoría ID *</label>
              <input formControlName="categoria_id" placeholder="ID de categoría..." [class.invalid]="isInvalid('categoria_id')" />
              <div class="error" *ngIf="isInvalid('categoria_id')">La categoría es obligatoria.</div>

              <label>Unidad de medida ID *</label>
              <input formControlName="unidad_medida_id" placeholder="ID de unidad de medida..." [class.invalid]="isInvalid('unidad_medida_id')" />
              <div class="error" *ngIf="isInvalid('unidad_medida_id')">La unidad de medida es obligatoria.</div>
            </div>

            <div class="col">
              <label>Proveedor ID *</label>
              <input formControlName="proveedor_id" placeholder="ID del proveedor..." [class.invalid]="isInvalid('proveedor_id')" />
              <div class="error" *ngIf="isInvalid('proveedor_id')">El proveedor es obligatorio.</div>

              <label>Precio de compra *</label>
              <input type="number" step="0.01" formControlName="precio_compra" placeholder="0.00" [class.invalid]="isInvalid('precio_compra')" />
              <div class="error" *ngIf="isInvalid('precio_compra')">El precio de compra es obligatorio.</div>

              <label>Precio de venta *</label>
              <input type="number" step="0.01" formControlName="precio_venta" placeholder="0.00" [class.invalid]="isInvalid('precio_venta')" />
              <div class="error" *ngIf="isInvalid('precio_venta')">El precio de venta es obligatorio.</div>

              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="requiere_ficha_tecnica" />
                  Requiere ficha técnica
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="requiere_condiciones_almacenamiento" />
                  Requiere condiciones de almacenamiento
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="requiere_certificaciones_sanitarias" />
                  Requiere certificaciones sanitarias
                </label>
              </div>

              <div class="actions">
                <button type="button" class="btn ghost" (click)="cancel()">Cancelar</button>
                <button type="submit" class="btn primary" [disabled]="form.invalid || loading">Registrar producto</button>
              </div>
            </div>
          </form>

          <!-- Bulk Upload Section -->
          <div class="bulk-upload-card">
            <h5>Carga masiva de productos</h5>
            <p class="muted">Sube un archivo CSV con múltiples productos para registrarlos de forma masiva.</p>
            
            <div *ngIf="bulkUploadMessage" class="alert" [ngClass]="bulkUploadSuccess ? 'success' : 'error'">
              {{ bulkUploadMessage }}
            </div>

            <div class="bulk-upload-section">
              <input 
                type="file" 
                #csvFileInput 
                accept=".csv" 
                (change)="onCsvFileSelected($event)" 
                class="file-input" 
                style="display: none;" 
              />
              <button 
                type="button" 
                class="btn ghost" 
                (click)="csvFileInput.click()" 
                [disabled]="bulkUploading">
                📁 Seleccionar CSV
              </button>
              <button 
                type="button" 
                class="btn primary" 
                (click)="uploadBulkProducts()" 
                [disabled]="!selectedCsvFile || bulkUploading"
                *ngIf="selectedCsvFile">
                📤 Subir productos
              </button>
              <span *ngIf="selectedCsvFile && !bulkUploading" class="file-name">{{ selectedCsvFile.name }}</span>
              <span *ngIf="bulkUploading" class="muted">Subiendo...</span>
            </div>
          </div>
        </section>

        <section class="card table-card">
          <h4>Productos registrados</h4>
          <p class="muted">Lista de todos los productos registrados en el sistema.</p>

          <div class="table-controls">
            <label for="perPageSelect" class="per-page-label">Mostrar:</label>
            <select id="perPageSelect" [(ngModel)]="perPage" (change)="onPerPageChange()" class="per-page-select">
              <option value="10">10 productos</option>
              <option value="20">20 productos</option>
              <option value="30">30 productos</option>
            </select>
          </div>

          <div class="table-wrap">
            <div *ngIf="loadingProducts" class="muted">Cargando productos...</div>
            <div *ngIf="productLoadError" class="alert error">
              {{ productLoadError }}
              <button class="btn ghost" (click)="loadProducts()">Reintentar</button>
            </div>
            <table *ngIf="!loadingProducts && !productLoadError" class="products-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Precio venta</th>
                  <th>Id Categoría</th>
                  <th>Id Proveedor</th>
                  <th>Fecha registro</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of products">
                  <td>{{ p.codigo }}</td>
                  <td>{{ p.nombre }}</td>
                  <td>\${{ p.precio_venta }}</td>
                  <td>{{ p.categoria_id }}</td>
                  <td>{{ p.proveedor_id }}</td>
                  <td>{{ formatDate(p.created_at) }}</td>
                </tr>
                <tr *ngIf="products.length === 0">
                  <td colspan="6" class="text-center muted">No hay productos registrados</td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination Controls -->
            <div *ngIf="!loadingProducts && !productLoadError && products.length > 0" class="pagination-controls">
              <button 
                class="btn pagination-btn" 
                [disabled]="currentPage <= 1" 
                (click)="previousPage()">
                ‹ Anterior
              </button>
              
              <span class="pagination-info">
                Página {{ currentPage }} de {{ totalPages || 1 }}
              </span>
              
              <button 
                class="btn pagination-btn" 
                [disabled]="currentPage >= totalPages || products.length < perPage" 
                (click)="nextPage()">
                Siguiente ›
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 24px;
      padding: 24px;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    label {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    input, textarea {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    input.invalid, textarea.invalid {
      border-color: #e53e3e;
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
    }
    
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      border: none;
    }
    
    .btn.primary {
      background: #0066cc;
      color: white;
    }
    
    .btn.ghost {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .alert {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .alert.success {
      background: #f0f9ff;
      color: #0066cc;
      border: 1px solid #0066cc;
    }
    
    .alert.error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #dc2626;
    }
    
    .error {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .muted {
      color: #666;
      margin-bottom: 16px;
    }
    
    .table-wrap {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    .text-center {
      text-align: center;
    }
    
    .table-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .per-page-label {
      font-weight: 500;
      color: #666;
    }
    
    .bulk-upload-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      border: 1px solid #e9ecef;
    }
    
    .bulk-upload-card h5 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .bulk-upload-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .file-name {
      font-size: 12px;
      color: #666;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .per-page-select {
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      padding: 16px 0;
    }
    
    .pagination-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      color: #666;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .pagination-btn:hover:not(:disabled) {
      background: #f0f0f0;
      color: #333;
    }
    
    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .pagination-info {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
  `]
})
export class ProductManagementComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  loadingProducts = false;
  productLoadError: string | null = null;
  perPage: number = 10; // Default to 10 products per page
  currentPage: number = 1;
  totalPages: number = 1;

  // Bulk upload properties
  selectedCsvFile: File | null = null;
  bulkUploading = false;
  bulkUploadMessage: string | null = null;
  bulkUploadSuccess = false;

  products: Product[] = [];
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private productsService: ProductsService) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      codigo: ['', Validators.required],
      categoria_id: ['', Validators.required],
      unidad_medida_id: ['', Validators.required],
      proveedor_id: ['', Validators.required],
      precio_compra: ['', [Validators.required, Validators.min(0)]],
      precio_venta: ['', [Validators.required, Validators.min(0)]],
      requiere_ficha_tecnica: [false],
      requiere_condiciones_almacenamiento: [false],
      requiere_certificaciones_sanitarias: [false]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cancel() {
    this.form.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const values = this.form.value;
    
    // Append all form values to FormData with proper formatting
    Object.keys(values).forEach(key => {
      let value = values[key];
      
      // Convert boolean values to strings as expected by the API
      if (typeof value === 'boolean') {
        value = value.toString();
      }
      
      formData.append(key, value);
    });

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.productsService.createProduct(formData).pipe(
      catchError(error => {
        console.error('Error creating product:', error);
        return of({ error: true, message: error });
      })
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.error) {
          this.errorMessage = this.extractErrorMessage(response.message);
        } else {
          this.successMessage = 'Producto registrado exitosamente';
          this.form.reset();
          this.loadProducts(); // Reload the products list
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  loadProducts() {
    this.loadingProducts = true;
    this.productLoadError = null;

    this.productsService.getProducts(this.currentPage, this.perPage).pipe(
      catchError(error => {
        console.error('Error loading products:', error);
        return of({ error: true, message: error });
      })
    ).subscribe({
      next: (response) => {
        this.loadingProducts = false;
        if (response.error) {
          this.productLoadError = 'Error al cargar productos. Por favor intenta nuevamente.';
        } else {
          // Handle both array response and paginated response
          if (Array.isArray(response)) {
            this.products = response;
            // If we got less than perPage products, we're probably on the last page
            this.totalPages = this.currentPage;
          } else {
            this.products = response.data || response.results || [];
            // Extract pagination info if available
            this.totalPages = response.total_pages || response.totalPages || Math.ceil((response.total || response.count || this.products.length) / this.perPage);
          }
        }
      },
      error: (error) => {
        this.loadingProducts = false;
        this.productLoadError = 'Error al cargar productos. Por favor intenta nuevamente.';
      }
    });
  }

  onPerPageChange() {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadProducts();
  }

  nextPage() {
    if (this.currentPage < this.totalPages && this.products.length >= this.perPage) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateStr;
    }
  }

  onCsvFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedCsvFile = file;
      this.bulkUploadMessage = null;
    } else {
      this.selectedCsvFile = null;
      this.bulkUploadMessage = 'Por favor selecciona un archivo CSV válido.';
      this.bulkUploadSuccess = false;
    }
  }

  uploadBulkProducts() {
    if (!this.selectedCsvFile) {
      this.bulkUploadMessage = 'Por favor selecciona un archivo CSV primero.';
      this.bulkUploadSuccess = false;
      return;
    }

    this.bulkUploading = true;
    this.bulkUploadMessage = null;

    this.productsService.bulkUploadProducts(this.selectedCsvFile).pipe(
      catchError(error => {
        console.error('Error uploading bulk products:', error);
        return of({ error: true, message: error });
      })
    ).subscribe({
      next: (response) => {
        this.bulkUploading = false;
        if (response.error) {
          this.bulkUploadMessage = this.extractErrorMessage(response.message);
          this.bulkUploadSuccess = false;
        } else {
          this.bulkUploadMessage = `Productos cargados exitosamente. ${response.created || response.count || 'Varios'} productos fueron creados.`;
          this.bulkUploadSuccess = true;
          this.selectedCsvFile = null;
          
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          
          this.loadProducts(); // Reload the products list
        }
      },
      error: (error) => {
        this.bulkUploading = false;
        this.bulkUploadMessage = this.extractErrorMessage(error);
        this.bulkUploadSuccess = false;
      }
    });
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (error?.error && typeof error.error === 'object') {
      // Handle validation errors
      const errors = Object.values(error.error).flat();
      return errors.length > 0 ? errors.join(', ') : 'Error desconocido';
    }
    return 'Error al procesar la solicitud';
  }
}
