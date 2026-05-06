import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Product, Settings } from '../../models/models';
import { LucidePlus, LucideSquarePen, LucideTrash2, LucideSave, LucideX, LucideUpload, LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucidePlus, LucideSquarePen, LucideTrash2, LucideSave, LucideX, LucideUpload, LucideArrowLeft],
  template: `
    <div class="admin-container container">
      <header class="admin-header glass">
        <div class="header-main">
          <button class="back-link" (click)="goBack()">
            <svg lucideArrowLeft size="20"></svg>
          </button>
          <h2>Panel de Administración</h2>
        </div>
        <!-- Toast Notification -->
        <div class="toast" *ngIf="toast.visible" [class.toast-error]="toast.isError">
          {{ toast.message }}
        </div>
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab-btn" [class.active]="activeTab === 'products'" (click)="activeTab = 'products'">
              Productos
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'settings'" (click)="activeTab = 'settings'">
              Apariencia
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'master'" (click)="activeTab = 'master'" *ngIf="isSuperAdmin">
              Master
            </button>
          </div>
          <div class="actions">
            <button class="logout-btn" (click)="logout()">Cerrar Sesión</button>
            <button class="back-btn" (click)="goToMyStore()">Ver Mi Tienda</button>
          </div>
        </div>
      </header>

      <!-- Products Tab -->
      <div class="tab-content" *ngIf="activeTab === 'products'">
        <div class="actions-row">
          <button class="add-btn" (click)="openAddForm()" *ngIf="!showForm">
            <svg lucidePlus size="18"></svg> Nuevo Producto
          </button>
        </div>

        <div class="form-card glass" *ngIf="showForm">
          <h3>{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h3>
          <form (ngSubmit)="saveProduct()">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="currentProduct.name" name="name" required>
            </div>
            <div class="form-row">
              <div class="form-group flex-grow">
                <label>Categoría</label>
                <input type="text" [(ngModel)]="currentProduct.category" name="category" placeholder="Ej: Cargadores, Audífonos">
              </div>
              <div class="form-group flex-grow">
                <label>Precio Base</label>
                <input type="number" [(ngModel)]="currentProduct.price" name="price" required>
              </div>
              <div class="form-group status-group">
                <label>Estado</label>
                <button type="button" class="status-toggle" [class.active]="currentProduct.isActive" (click)="currentProduct.isActive = !currentProduct.isActive">
                  {{ currentProduct.isActive ? '✅ Activo' : '🚫 Inactivo' }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="currentProduct.description" name="description"></textarea>
            </div>
            <div class="form-group">
              <label>Imagen del Producto</label>
              <div class="upload-row">
                <input type="text" [(ngModel)]="currentProduct.imageUrl" name="imageUrl" placeholder="URL de la imagen...">
                <input type="file" #prodInput (change)="onProductImageUpload($event)" style="display: none" accept="image/*">
                <button type="button" class="upload-btn" (click)="prodInput.click()">
                  <svg lucideUpload size="18"></svg> Subir
                </button>
              </div>
            </div>
            <div class="form-group variants-section">
              <div class="section-header">
                <label>Variantes y Opciones (Opcional)</label>
                <button type="button" class="add-variant-btn" (click)="addVariantGroup()">
                  <svg lucidePlus size="14"></svg> Añadir Grupo
                </button>
              </div>
              
              <div class="variant-group glass" *ngFor="let variant of currentProduct.variants; let i = index">
                <div class="group-header">
                  <input type="text" [(ngModel)]="variant.name" name="vName-{{i}}" placeholder="Ej: Talla, Color, Memoria...">
                  <button type="button" class="remove-btn" (click)="removeVariantGroup(i)">
                    <svg lucideTrash2 size="16"></svg>
                  </button>
                </div>
                
                <div class="options-list">
                  <div class="option-item" *ngFor="let opt of variant.options; let j = index">
                    <button type="button" class="avail-btn" [class.off]="opt.isAvailable === false" (click)="opt.isAvailable = (opt.isAvailable === false ? true : false)">
                      <svg lucideSquarePen *ngIf="opt.isAvailable !== false" size="14"></svg>
                      <svg lucideX *ngIf="opt.isAvailable === false" size="14"></svg>
                    </button>
                    <input type="text" [(ngModel)]="opt.label" name="optL-{{i}}-{{j}}" placeholder="Atributo">
                    <input type="number" [(ngModel)]="opt.price" name="optP-{{i}}-{{j}}" placeholder="Precio de esta opción">
                    
                    <div class="opt-img-mini" *ngIf="opt.imageUrl">
                      <img [src]="opt.imageUrl">
                    </div>
                    
                    <button type="button" class="opt-upload-btn" (click)="optInput.click()">
                      <svg lucideUpload size="14"></svg>
                    </button>
                    <input type="file" #optInput (change)="onOptionImageUpload($event, i, j)" style="display: none" accept="image/*">

                    <button type="button" class="remove-btn" (click)="removeOption(i, j)">
                      <svg lucideX size="14"></svg>
                    </button>
                  </div>
                  <button type="button" class="add-option-btn" (click)="addOption(i)">
                    <svg lucidePlus size="14"></svg> Añadir Opción
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group variants-section">
              <div class="section-header">
                <label>Especificaciones Técnicas (Opcional)</label>
                <button type="button" class="add-variant-btn" (click)="addSpecification()">
                  <svg lucidePlus size="14"></svg> Añadir Especificación
                </button>
              </div>
              
              <div class="specs-grid" *ngIf="currentProduct.specifications?.length">
                <div class="spec-row glass" *ngFor="let spec of currentProduct.specifications; let i = index">
                  <input type="text" [(ngModel)]="spec.key" name="specK-{{i}}" placeholder="Ej: Memoria">
                  <input type="text" [(ngModel)]="spec.value" name="specV-{{i}}" placeholder="Ej: 128GB">
                  <button type="button" class="remove-btn" (click)="removeSpecification(i)">
                    <svg lucideX size="16"></svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" (click)="closeForm()">
                <svg lucideX size="18"></svg> Cancelar
              </button>
              <button type="submit" class="save-btn">
                <svg lucideSave size="18"></svg> Guardar
              </button>
            </div>
          </form>
        </div>

        <div class="product-list">
          <div class="product-item glass" *ngFor="let product of products">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/50'" class="list-img">
            <div class="list-info">
              <h4>{{ product.name }}</h4>
              <span class="category-badge" *ngIf="product.category">{{ product.category }}</span>
              <span class="price-span">$ {{ product.price | number }}</span>
            </div>
            <div class="list-actions">
              <button class="edit-btn" (click)="editProduct(product)"><svg lucideSquarePen size="20"></svg></button>
              <button class="delete-btn" (click)="deleteProduct(product.id)"><svg lucideTrash2 size="20"></svg></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div class="tab-content" *ngIf="activeTab === 'settings'">
        <div class="loading-state" *ngIf="!settings">
          <p>Cargando configuración de la tienda...</p>
          <button (click)="loadSettings()" class="retry-btn">Reintentar</button>
        </div>
        <div class="form-card glass" *ngIf="settings">
          <h3>Personalización del Negocio</h3>
          <form (ngSubmit)="saveSettings()">
            <div class="form-group">
              <label>Nombre del Negocio</label>
              <input type="text" [(ngModel)]="settings.businessName" name="businessName">
            </div>
            <div class="form-group">
              <label>Link de tu Tienda (Slug)</label>
              <div class="slug-input-wrapper">
                <span class="prefix">localhost:4200/</span>
                <input type="text" [(ngModel)]="settings.slug" name="slug">
              </div>
              <small>Este es el enlace que compartirás con tus clientes.</small>
            </div>

            <div class="form-group">
              <label>Descripción de la Tienda</label>
              <textarea [(ngModel)]="settings.description" name="description" placeholder="Una breve descripción de tu negocio..."></textarea>
            </div>
            
            <div class="form-group">
              <label>Número WhatsApp (ej: 57300...)</label>
              <input type="text" [(ngModel)]="settings.whatsappNumber" name="whatsappNumber">
            </div>
            
            <div class="color-grid">
              <div class="form-group">
                <label>Color Primario</label>
                <input type="color" [(ngModel)]="settings.primaryColor" name="primaryColor" (input)="updatePreview()">
              </div>
              <div class="form-group">
                <label>Color Secundario</label>
                <input type="color" [(ngModel)]="settings.secondaryColor" name="secondaryColor" (input)="updatePreview()">
              </div>
              <div class="form-group">
                <label>Color de Fondo</label>
                <input type="color" [(ngModel)]="settings.backgroundColor" name="backgroundColor" (input)="updatePreview()">
              </div>
            </div>

            <div class="form-group">
              <label>Logo del Negocio (Recomendado: Cuadrado 200x200)</label>
              <div class="image-upload-wrapper">
                <div class="image-preview" *ngIf="settings.logoUrl">
                  <img [src]="settings.logoUrl" alt="Logo preview">
                </div>
                <div class="upload-controls">
                  <input type="text" [(ngModel)]="settings.logoUrl" name="logoUrl" placeholder="URL de la imagen...">
                  <label class="upload-btn">
                    <svg lucideUpload size="18"></svg> Subir Imagen
                    <input type="file" (change)="onImageUpload($event, 'logo')" hidden accept="image/*">
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Imagen de Fondo de la Tienda</label>
              <div class="image-upload-wrapper">
                <div class="image-preview bg-preview" *ngIf="settings.backgroundImageUrl">
                  <img [src]="settings.backgroundImageUrl" alt="BG preview">
                </div>
                <div class="upload-controls">
                  <input type="text" [(ngModel)]="settings.backgroundImageUrl" name="backgroundImageUrl" placeholder="URL de la imagen de fondo...">
                  <label class="upload-btn">
                    <svg lucideUpload size="18"></svg> Subir Imagen
                    <input type="file" (change)="onImageUpload($event, 'background')" hidden accept="image/*">
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Mensaje de Bienvenida</label>
              <textarea [(ngModel)]="settings.welcomeMessage" name="welcomeMessage"></textarea>
            </div>
            <button type="submit" class="save-btn full-width">
              <svg lucideSave size="20"></svg> Guardar Configuración
            </button>
          </form>
        </div>
      </div>

      <!-- Master Tab (Super Admin Only) -->
      <div class="tab-content" *ngIf="activeTab === 'master' && isSuperAdmin">
        <div class="form-card glass">
          <h3>Panel de Control SaaS (Super Admin)</h3>
          <p class="section-desc">Aquí puedes ver todas las tiendas creadas en la plataforma y el contacto de sus dueños.</p>
          
          <div class="master-stats" *ngIf="masterStores.length > 0">
            <div class="stat-card glass">
              <span class="stat-label">Total Tiendas</span>
              <span class="stat-value">{{ masterStores.length }}</span>
            </div>
          </div>

          <div class="table-wrapper glass">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Nombre Tienda</th>
                  <th>Slug / URL</th>
                  <th>Dueño (Email)</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let store of masterStores">
                  <td><strong>{{ store.name || 'Sin Nombre' }}</strong></td>
                  <td><a [href]="'/' + store.slug" target="_blank" class="store-link">/{{ store.slug }}</a></td>
                  <td>{{ store.ownerEmail }}</td>
                  <td>{{ store.createdAt | date:'shortDate' }}</td>
                  <td>
                    <button class="view-btn" (click)="viewStore(store.slug)">Visitar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px 0; }
    .admin-header { padding: 20px; margin-bottom: 25px; display: flex; flex-direction: column; gap: 15px; position: relative; }
    .toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: #2ecc71; color: white; padding: 14px 28px; border-radius: 12px;
      font-weight: 700; font-size: 0.95rem; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      animation: slideUp 0.3s ease-out;
    }
    .toast.toast-error { background: #e74c3c; }
    @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    .header-main { display: flex; align-items: center; gap: 15px; }
    .back-link { background: transparent; color: #666; padding: 0; min-height: auto; }
    .back-link:hover { color: var(--primary-color); }
    .tabs-container { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 30px; }
    .tabs { display: flex; gap: 8px; background: #f1f3f5; padding: 6px; border-radius: 12px; width: fit-content; }
    .tab-btn { background: transparent; border: none; padding: 10px 24px; font-size: 1rem; font-weight: 600; color: #6c757d; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 8px; }
    .tab-btn:hover:not(.active) { background: #e9ecef; color: #495057; }
    .tab-btn.active { background: white; color: #ff4757; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .actions { display: flex; gap: 10px; align-items: center; }
    
    .back-btn { background: #f0f0f0; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; color: #555; transition: 0.2s; font-size: 0.95rem; }
    .back-btn:hover { background: #e0e0e0; }
    .logout-btn { background: #ff5252; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.95rem; }
    .logout-btn:hover { background: #e53935; }
    .actions-row { margin-bottom: 20px; }
    .form-card { padding: 25px; margin-bottom: 30px; }
    .form-card h3 { margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 0.9rem; font-weight: 600; color: var(--text-light); }
    .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
    .slug-input-wrapper { display: flex; align-items: center; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 5px; }
    .slug-input-wrapper .prefix { padding: 12px; color: #888; background: #eee; border-right: 1px solid #ddd; font-size: 0.95rem; }
    .slug-input-wrapper input { border: none; border-radius: 0; flex: 1; }
    .form-group small { display: block; margin-top: 5px; color: #888; font-size: 0.85rem; }
    
    .color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px; }
    .image-upload-wrapper { display: flex; flex-direction: column; gap: 15px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px dashed #ddd; }
    .image-preview { width: 120px; height: 120px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .image-preview img { width: 100%; height: 100%; object-fit: cover; }
    .bg-preview { width: 100%; height: 100px; border-radius: 12px; }
    .upload-controls { display: flex; gap: 10px; }
    .upload-controls input { flex-grow: 1; }
    .upload-btn { background: #3f51b5; color: white !important; display: flex; align-items: center; gap: 8px; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap; }
    .upload-btn svg { color: white !important; }
    
    input[type="color"] {
      -webkit-appearance: none;
      border: 1px solid #ddd;
      width: 100%;
      height: 45px;
      cursor: pointer;
      border-radius: 8px;
      padding: 5px;
      background: white;
    }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: none; border-radius: 6px; }

    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .save-btn { background: var(--primary-color); color: white; padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .cancel-btn { background: #eee; color: #666; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
    .full-width { width: 100%; margin-top: 10px; }
    
    .product-list { display: flex; flex-direction: column; gap: 12px; }
    .product-item { display: flex; align-items: center; gap: 15px; padding: 15px; }
    .list-img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
    .list-info { flex-grow: 1; }
    .list-info h4 { margin: 0; margin-bottom: 4px; }
    .price-span { display: block; font-weight: 600; color: #555; }
    .category-badge { display: inline-block; background: #e0e0e0; color: #555; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; }
    .list-actions { display: flex; gap: 8px; }
    .edit-btn { color: var(--secondary-color); background: transparent; padding: 0; min-height: auto; }
    .delete-btn { color: #ff5252; background: transparent; padding: 0; min-height: auto; width: auto; }

    .loading-state { text-align: center; padding: 40px; background: white; border-radius: 12px; margin-top: 20px; }
    .retry-btn { margin-top: 15px; background: #eee; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; }
    .retry-btn:hover { background: #ddd; }

    .variants-section { margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .add-variant-btn { background: #4caf50; color: white; padding: 5px 12px; font-size: 0.8rem; }
    .variant-group { padding: 15px; margin-bottom: 15px; border: 1px solid #e0e0e0; }
    .group-header { display: flex; gap: 10px; margin-bottom: 10px; }
    .group-header input { flex-grow: 1; font-weight: 700; background: #fff; }
    .options-list { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
    .option-item { display: flex; gap: 8px; align-items: center; }
    .option-item input:nth-child(2) { width: 80px; }
    .opt-upload-btn { background: #eee; padding: 5px; border-radius: 4px; min-height: auto; }
    .opt-img-mini { width: 30px; height: 30px; border-radius: 4px; overflow: hidden; border: 1px solid #ddd; }
    .opt-img-mini img { width: 100%; height: 100%; object-fit: cover; }
    .avail-btn { background: #4caf50; color: white; padding: 5px; border-radius: 4px; min-height: auto; width: 30px; }
    .avail-btn.off { background: #ff5252; }
    .form-row { display: flex; gap: 20px; align-items: flex-end; }
    .flex-grow { flex-grow: 1; }
    .status-group { min-width: 120px; }
    .status-toggle { width: 100%; height: 45px; border-radius: 8px; font-weight: 700; background: #eee; color: #666; }
    .status-toggle.active { background: #e8f5e9; color: #2e7d32; border: 2px solid #2e7d32; }
    
    .add-option-btn { background: #eee; color: #666; font-size: 0.75rem; align-self: flex-start; margin-top: 5px; }
    .remove-btn { color: #ff5252; background: transparent; padding: 0; min-height: auto; width: auto; }

    /* Master Styles */
    .section-desc { color: #666; margin-bottom: 20px; font-size: 0.95rem; }
    .master-stats { display: flex; gap: 20px; margin-bottom: 25px; }
    .stat-card { padding: 15px 25px; text-align: center; min-width: 150px; }
    .stat-label { display: block; font-size: 0.85rem; color: #888; margin-bottom: 5px; }
    .stat-value { font-size: 1.8rem; font-weight: 800; color: #3f51b5; }
    
    .table-wrapper { overflow-x: auto; margin-top: 10px; }
    .master-table { width: 100%; border-collapse: collapse; text-align: left; }
    .master-table th { padding: 15px; border-bottom: 2px solid #eee; color: #555; font-size: 0.9rem; }
    .master-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 0.95rem; }
    .store-link { color: #3f51b5; font-weight: 600; text-decoration: none; }
    .store-link:hover { text-decoration: underline; }
    .view-btn { background: #eee; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .view-btn:hover { background: #e0e0e0; }

    .specs-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
    .spec-row { display: flex; gap: 10px; align-items: center; padding: 10px; }
    .spec-row input { flex: 1; min-width: 0; padding: 8px !important; }
  `]
})
export class AdminComponent implements OnInit {
  activeTab: 'products' | 'settings' | 'master' = 'products';
  products: Product[] = [];
  settings: Settings | null = null;
  masterStores: any[] = [];
  isSuperAdmin = false;
  private adminEmails = ['juanse1030@gmail.com', 'uparshopelectronics@gmail.com'];
  toast = { visible: false, message: '', isError: false };
  private toastTimer: any;
  
  showForm = false;
  editingProduct: Product | null = null;
  currentProduct: Partial<Product> = { name: '', price: 0, description: '', imageUrl: '', category: '', variants: [], specifications: [] };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private isLoaded = false;

  ngOnInit() {
    // Escuchar la sesión de forma reactiva
    this.authService.currentSession$.subscribe(session => {
      if (session && !this.isLoaded) {
        this.isLoaded = true;
        this.checkSuperAdmin(session.user?.email);
        this.loadProducts();
        this.loadSettings();
        if (this.isSuperAdmin) {
          this.loadMasterData();
        }
      }
    });
  }

  checkSuperAdmin(email?: string) {
    this.isSuperAdmin = !!email && this.adminEmails.includes(email);
  }

  private showToast(message: string, isError = false) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, isError };
    this.toastTimer = setTimeout(() => this.toast.visible = false, 3000);
  }

  loadMasterData() {
    this.dataService.getMasterStores().subscribe({
      next: (data) => this.masterStores = data,
      error: () => this.showToast('Error cargando datos de tiendas', true)
    });
  }

  loadProducts() {
    this.dataService.getMyProducts().subscribe({
      next: (data) => this.products = data,
      error: () => this.showToast('Error cargando productos', true)
    });
  }

  loadSettings() {
    this.dataService.getMySettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.updatePreview();
        this.cdr.detectChanges();
      },
      error: () => this.showToast('Error cargando configuración', true)
    });
  }

  openAddForm() {
    this.editingProduct = null;
    this.currentProduct = { name: '', price: 0, description: '', imageUrl: '', category: '', variants: [], specifications: [] };
    this.showForm = true;
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.currentProduct = JSON.parse(JSON.stringify(product));
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
  }

  saveProduct() {
    if (this.editingProduct) {
      const payload: any = {
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        description: this.currentProduct.description,
        imageUrl: this.currentProduct.imageUrl,
        category: this.currentProduct.category,
        isActive: this.currentProduct.isActive,
        variants: this.currentProduct.variants,
        specifications: this.currentProduct.specifications
      };
      this.dataService.updateProduct(this.editingProduct.id, payload).subscribe({
        next: () => { this.showToast('Producto actualizado'); this.loadProducts(); this.closeForm(); },
        error: () => this.showToast('Error al actualizar el producto', true)
      });
    } else {
      this.dataService.createProduct(this.currentProduct).subscribe({
        next: () => { this.showToast('Producto creado'); this.loadProducts(); this.closeForm(); },
        error: () => this.showToast('Error al crear el producto', true)
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.dataService.deleteProduct(id).subscribe({
        next: () => { this.showToast('Producto eliminado'); this.loadProducts(); },
        error: () => this.showToast('Error al eliminar el producto', true)
      });
    }
  }

  updatePreview() {
    if (this.settings) {
      document.documentElement.style.setProperty('--primary-color', this.settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', this.settings.secondaryColor);
    }
  }

  saveSettings() {
    if (this.settings) {
      const payload = {
        businessName: this.settings.businessName,
        logoUrl: this.settings.logoUrl,
        primaryColor: this.settings.primaryColor,
        secondaryColor: this.settings.secondaryColor,
        whatsappNumber: this.settings.whatsappNumber,
        welcomeMessage: this.settings.welcomeMessage,
        slug: this.settings.slug,
        description: this.settings.description,
        backgroundColor: this.settings.backgroundColor,
        backgroundImageUrl: this.settings.backgroundImageUrl,
      };
      this.dataService.updateSettings(payload).subscribe({
        next: (s) => { this.settings = s; this.updatePreview(); this.showToast('Configuración guardada'); },
        error: () => this.showToast('Error al guardar la configuración', true)
      });
    }
  }

  onImageUpload(event: any, type: 'logo' | 'background' = 'logo') {
    const file = event.target.files[0];
    if (file && this.settings) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => {
          if (type === 'logo') this.settings!.logoUrl = res.url;
          else this.settings!.backgroundImageUrl = res.url;
          this.showToast('Imagen subida');
        },
        error: () => this.showToast('Error al subir la imagen', true)
      });
    }
  }

  onProductImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => { this.currentProduct.imageUrl = res.url; this.showToast('Imagen del producto subida'); },
        error: () => this.showToast('Error al subir la imagen del producto', true)
      });
    }
  }

  // Variants Management
  addVariantGroup() {
    if (!this.currentProduct.variants) this.currentProduct.variants = [];
    this.currentProduct.variants.push({ name: '', options: [{ label: '', price: 0 }] });
  }

  removeVariantGroup(index: number) {
    this.currentProduct.variants?.splice(index, 1);
  }

  addOption(variantIndex: number) {
    this.currentProduct.variants![variantIndex].options.push({ label: '', price: 0 });
  }

  onOptionImageUpload(event: any, vIdx: number, oIdx: number) {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => { this.currentProduct.variants![vIdx].options[oIdx].imageUrl = res.url; this.showToast('Imagen de variante subida'); },
        error: () => this.showToast('Error al subir imagen de variante', true)
      });
    }
  }

  removeOption(variantIndex: number, optionIndex: number) {
    this.currentProduct.variants![variantIndex].options.splice(optionIndex, 1);
  }

  addSpecification() {
    if (!this.currentProduct.specifications) this.currentProduct.specifications = [];
    this.currentProduct.specifications.push({ key: '', value: '' });
  }

  removeSpecification(index: number) {
    this.currentProduct.specifications?.splice(index, 1);
  }

  goBack() {
    if (this.settings?.slug) {
      this.router.navigate(['/', this.settings.slug]);
    } else {
      window.history.back();
    }
  }

  goToMyStore() {
    if (this.settings?.slug) {
      window.open('/' + this.settings.slug, '_blank');
    } else {
      this.showToast('Configura el slug de tu tienda primero', true);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }

  viewStore(slug: string) {
    const url = this.router.serializeUrl(this.router.createUrlTree([`/${slug}`]));
    window.open(url, '_blank');
  }
}
