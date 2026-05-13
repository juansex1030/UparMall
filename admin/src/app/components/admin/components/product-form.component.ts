import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '@shared/models/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="slim-form-container">
      <!-- HEADER COMPACTO -->
      <div class="slim-header">
        <div class="header-left">
          <div class="h-icon" [style.background]="editingProduct ? '#2563eb' : '#059669'">
            <i class="fas fa-box-open"></i>
          </div>
          <h2 class="main-title">{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h2>
        </div>
        <button class="btn-close-circle" (click)="close.emit()" title="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="slim-body">
        <!-- GENERAL -->
        <div class="slim-section s-blue">
          <div class="s-header"><i class="fas fa-tag"></i> Datos Principales</div>
          <div class="s-grid">
            <div class="f-group">
              <span class="f-label">Nombre del Producto</span>
              <input type="text" [(ngModel)]="product.name" placeholder="Ej: Cargador iPhone 20W">
            </div>
            <div class="f-group">
              <span class="f-label">Categoría</span>
              <input type="text" [(ngModel)]="product.category" placeholder="Ej: Electrónica">
            </div>
          </div>
          <div class="f-group">
            <span class="f-label">Descripción Detallada</span>
            <textarea [(ngModel)]="product.description" rows="2" placeholder="Describe brevemente las ventajas..."></textarea>
          </div>
        </div>

        <!-- ESPECIFICACIONES -->
        <div class="slim-section s-purple">
          <div class="s-header">
            <span><i class="fas fa-list"></i> Especificaciones Técnicas</span>
            <button class="btn-add-action purple" (click)="addSpecification()" title="Añadir Especificación">
              <i class="fas fa-plus"></i> AÑADIR NUEVA
            </button>
          </div>
          <div class="s-list">
            <div *ngFor="let s of product.specifications; let i = index" class="s-item-row">
              <div class="input-with-label">
                <span class="mini-label">Propiedad</span>
                <input type="text" [(ngModel)]="s.key" placeholder="Ej: RAM">
              </div>
              <div class="input-with-label">
                <span class="mini-label">Valor</span>
                <input type="text" [(ngModel)]="s.value" placeholder="Ej: 8GB">
              </div>
              <button class="btn-del-action" (click)="removeSpecification(i)" title="Eliminar">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <div *ngIf="!product.specifications?.length" class="empty-msg">No has añadido especificaciones técnicas</div>
          </div>
        </div>

        <!-- MEDIA & PRECIO -->
        <div class="slim-dual-row">
          <div class="slim-section s-indigo flex-2">
            <div class="s-header"><i class="fas fa-image"></i> Multimedia e Imagen</div>
            <div class="media-flex">
              <div class="mini-prev" [style.background-image]="'url(' + product.imageUrl + ')'">
                <i *ngIf="!product.imageUrl" class="fas fa-camera"></i>
              </div>
              <div class="input-with-label flex-1">
                <span class="mini-label">URL de la Imagen</span>
                <input type="text" [(ngModel)]="product.imageUrl" placeholder="https://ejemplo.com/foto.jpg">
              </div>
              <label class="btn-upload-action" title="Subir archivo">
                <i class="fas fa-cloud-upload-alt"></i>
                <input type="file" (change)="uploadImage.emit($event)" hidden accept="image/*">
              </label>
            </div>
          </div>
          
          <div class="slim-section s-emerald flex-1">
            <div class="s-header"><i class="fas fa-dollar-sign"></i> Precio y Venta</div>
            <div class="price-flex">
              <div class="price-input-wrap">
                <span class="mini-label">Precio Final</span>
                <div class="p-wrap">
                  <span class="c-tag">$</span>
                  <input type="number" [(ngModel)]="product.price" placeholder="0">
                </div>
              </div>
              <div class="toggle-wrap">
                <span class="mini-label">Estado</span>
                <button class="btn-toggle-action" [class.active]="product.isActive" (click)="product.isActive = !product.isActive" [title]="product.isActive ? 'Ocultar' : 'Mostrar'">
                  <i class="fas" [class.fa-eye]="product.isActive" [class.fa-eye-slash]="!product.isActive"></i>
                  <span class="toggle-text">{{ product.isActive ? 'VISIBLE' : 'OCULTO' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- VARIANTES -->
        <div class="slim-section s-orange">
          <div class="s-header">
            <span><i class="fas fa-layer-group"></i> Variantes y Opciones</span>
            <button class="btn-add-action orange" (click)="addVariantGroup()" title="Añadir Grupo">
              <i class="fas fa-plus"></i> NUEVO GRUPO
            </button>
          </div>
          <div class="v-stack">
            <div *ngFor="let v of product.variants; let i = index" class="v-card-modern">
              <div class="v-head-modern">
                <div class="input-with-label flex-1">
                  <span class="mini-label">Nombre del Grupo (Color, Talla, etc.)</span>
                  <input type="text" [(ngModel)]="v.name" placeholder="Ej: Color" class="v-name-input">
                </div>
                <button class="btn-del-action" (click)="removeVariantGroup(i)" title="Eliminar Grupo">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <div class="opt-flex-wrap">
                <div *ngFor="let opt of v.options; let j = index" class="opt-pill-modern">
                  <button class="pill-check" [class.on]="opt.isAvailable !== false" (click)="opt.isAvailable = opt.isAvailable === false ? true : false">
                    <i class="fas fa-check"></i>
                  </button>
                  
                  <!-- VARIANT IMAGE UPLOAD -->
                  <label class="variant-img-upload" [title]="opt.imageUrl ? 'Cambiar imagen' : 'Subir imagen'">
                    <i class="fas" [class.fa-image]="!opt.imageUrl" [class.fa-sync-alt]="opt.imageUrl"></i>
                    <img *ngIf="opt.imageUrl" [src]="opt.imageUrl" class="mini-variant-prev">
                    <input type="file" (change)="uploadVariantImage.emit({event: $event, vIdx: i, oIdx: j})" hidden accept="image/*">
                  </label>

                  <input type="text" [(ngModel)]="opt.label" placeholder="Valor" class="p-input">
                  <input type="number" [(ngModel)]="opt.price" placeholder="+$" class="p-price">
                  <button class="pill-del" (click)="removeOption(i, j)" title="Borrar">×</button>
                </div>
                <button class="btn-add-pill" (click)="addOption(i)">+ AÑADIR OPCIÓN</button>
              </div>
            </div>
          </div>
        </div>

        <!-- GESTIÓN DE STOCK (OPCIONAL) -->
        <div class="slim-section s-rose">
          <div class="s-header">
            <span><i class="fas fa-warehouse"></i> Control de Inventario (Opcional)</span>
            <div class="ios-toggle-compact" [class.active]="product.manageStock" (click)="product.manageStock = !product.manageStock">
              <div class="toggle-handle"></div>
            </div>
          </div>
          
          <div class="s-grid" *ngIf="product.manageStock">
            <div class="f-group">
              <span class="f-label">Stock Actual</span>
              <div class="input-with-icon">
                <i class="fas fa-cubes"></i>
                <input type="number" [(ngModel)]="product.stock" placeholder="0">
              </div>
            </div>
            <div class="f-group">
              <span class="f-label">Alerta de Stock Bajo</span>
              <div class="input-with-icon">
                <i class="fas fa-exclamation-triangle"></i>
                <input type="number" [(ngModel)]="product.lowStockThreshold" placeholder="5">
              </div>
            </div>
          </div>
          <div *ngIf="!product.manageStock" class="empty-msg" style="border-style: solid; background: #fff5f7; border-color: #fecdd3; color: #9f1239;">
            Gestión de inventario desactivada para este producto.
          </div>
        </div>

        <!-- FOOTER -->
        <div class="slim-footer">
          <button class="btn-footer-cancel" (click)="close.emit()">DESCARTAR</button>
          <button class="btn-footer-save" (click)="save.emit()" [disabled]="isSaving">
            <i *ngIf="!isSaving" class="fas fa-save"></i>
            <i *ngIf="isSaving" class="fas fa-spinner fa-spin"></i>
            {{ isSaving ? 'GUARDANDO...' : 'GUARDAR PRODUCTO' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slim-form-container { background: white; border-radius: 20px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
    
    .slim-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 25px; background: #fff; border-bottom: 3px solid #f1f5f9; }
    .header-left { display: flex; align-items: center; gap: 15px; }
    .h-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; }
    .main-title { margin: 0; font-size: 1.2rem; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    
    .btn-close-circle { width: 36px; height: 36px; border-radius: 50%; border: none; background: #f1f5f9; color: #475569; cursor: pointer; transition: 0.2s; font-size: 1.1rem; }
    .btn-close-circle:hover { background: #fee2e2; color: #ef4444; transform: scale(1.1); }

    .slim-body { padding: 20px; background: #f8fafc; }
    .slim-section { background: white; border-radius: 16px; padding: 18px; margin-bottom: 20px; border: 1px solid #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    
    .s-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 950; text-transform: uppercase; color: #1e293b; margin-bottom: 15px; letter-spacing: 1px; }
    .s-header i { margin-right: 8px; color: #64748b; }

    .s-blue { border-left: 6px solid #2563eb; } .s-purple { border-left: 6px solid #7c3aed; }
    .s-indigo { border-left: 6px solid #4f46e5; } .s-emerald { border-left: 6px solid #059669; }
    .s-orange { border-left: 6px solid #d97706; }
    .s-rose { border-left: 6px solid #e11d48; }

    .s-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px; }
    .f-group { display: flex; flex-direction: column; gap: 6px; }
    .f-label { font-size: 0.75rem; font-weight: 900; color: #334155; text-transform: uppercase; margin-left: 2px; }
    
    .input-with-label { display: flex; flex-direction: column; gap: 4px; }
    .mini-label { font-size: 0.65rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-left: 2px; }

    input, textarea { 
      width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #cbd5e1; 
      font-size: 0.95rem; font-weight: 800; color: #0f172a; box-sizing: border-box; 
      transition: 0.2s; background: #fff; 
    }
    input:focus, textarea:focus { outline: none; border-color: #0f172a; background: #fff; box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05); }
    input::placeholder, textarea::placeholder { color: #94a3b8; font-weight: 600; }

    /* BOTONES ACCION */
    .btn-add-action { 
      padding: 8px 16px; border-radius: 10px; border: none; color: white; font-size: 0.75rem; font-weight: 900; 
      cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
    .btn-add-action.purple { background: #7c3aed; }
    .btn-add-action.orange { background: #d97706; }
    .btn-add-action:hover { transform: translateY(-2.5px) scale(1.02); filter: brightness(1.1); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
    .btn-add-action:active { transform: translateY(0) scale(0.98); }

    .btn-del-action { width: 38px; height: 38px; border-radius: 10px; border: none; background: #fee2e2; color: #ef4444; cursor: pointer; transition: 0.2s; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
    .btn-del-action:hover { background: #ef4444; color: white; transform: scale(1.1); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
    .btn-del-action:active { transform: scale(0.95); }

    .s-list { display: flex; flex-direction: column; gap: 12px; }
    .s-item-row { display: flex; gap: 12px; align-items: flex-end; }

    .slim-dual-row { display: flex; gap: 20px; margin-bottom: 20px; }
    .flex-1 { flex: 1; } .flex-2 { flex: 2; }
    .media-flex, .price-flex { display: flex; gap: 12px; align-items: flex-end; }
    
    .mini-prev { width: 48px; height: 48px; border-radius: 12px; background: #fff; background-size: cover; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
    
    .btn-upload-action { 
      background: white; border: 2px solid #cbd5e1; width: 48px; height: 48px; border-radius: 12px; 
      cursor: pointer; color: #1e293b; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 1.2rem;
    }
    .btn-upload-action:hover { border-color: #0f172a; color: #0f172a; background: #f1f5f9; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .btn-upload-action:active { transform: translateY(0); }

    .p-wrap { position: relative; width: 100%; }
    .c-tag { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-weight: 950; color: #059669; font-size: 1.2rem; }
    .p-wrap input { padding-left: 30px; border-color: #6ee7b7; font-size: 1.3rem; font-weight: 950; color: #064e3b; }

    .btn-toggle-action { 
      height: 48px; padding: 0 15px; border-radius: 12px; border: 2px solid #cbd5e1; background: #fff; 
      color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px;
    }
    .btn-toggle-action.active { background: #0f172a; color: white; border-color: #0f172a; }
    .btn-toggle-action:hover { transform: translateY(-2px); border-color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .btn-toggle-action:active { transform: translateY(0); }
    .toggle-text { font-size: 0.7rem; font-weight: 900; }

    .v-stack { display: flex; flex-direction: column; gap: 15px; }
    .v-card-modern { background: #fff; border: 2px solid #f1f5f9; border-radius: 16px; padding: 18px; }
    .v-head-modern { display: flex; justify-content: space-between; gap: 15px; align-items: flex-end; margin-bottom: 15px; }
    .v-name-input { border-bottom: 2.5px solid #f1f5f9; border-radius: 0; font-size: 1rem; }
    .v-name-input:focus { border-color: #d97706; }
    
    .opt-flex-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
    .opt-pill-modern { display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 6px 12px; border-radius: 100px; border: 1.5px solid #cbd5e1; }
    .pill-check { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #fff; color: transparent; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .pill-check.on { background: #059669; color: white; border-color: #059669; }
    .p-input, .p-price { font-size: 0.85rem; font-weight: 900; }
    .p-input { width: 100px; color: #1e293b; } .p-price { width: 80px; color: #059669; }
    .pill-del { color: #94a3b8; font-size: 1.2rem; cursor: pointer; }

    .variant-img-upload { 
      width: 32px; height: 32px; border-radius: 8px; background: #fff; border: 1.5px solid #cbd5e1; 
      display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden;
      font-size: 0.7rem; color: #64748b;
    }
    .variant-img-upload:hover { border-color: #0f172a; color: #0f172a; }
    .mini-variant-prev { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
    .variant-img-upload i { position: relative; z-index: 1; text-shadow: 0 0 2px white; }

    .btn-add-pill { background: white; border: 2px dashed #cbd5e1; padding: 6px 18px; border-radius: 100px; font-size: 0.75rem; color: #1e293b; font-weight: 900; cursor: pointer; transition: 0.2s; }
    .btn-add-pill:hover { border-color: #0f172a; background: #f1f5f9; }

    .empty-msg { text-align: center; font-size: 0.8rem; color: #64748b; padding: 15px; font-weight: 800; border: 2px dashed #e2e8f0; border-radius: 12px; }

    /* Icons inside inputs */
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-with-icon i { position: absolute; left: 16px; color: #64748b; font-size: 0.9rem; }
    .input-with-icon input { padding-left: 45px; }

    /* Toggle switch compacto */
    .ios-toggle-compact { width: 44px; height: 22px; background: #cbd5e1; border-radius: 100px; position: relative; cursor: pointer; transition: 0.3s; }
    .ios-toggle-compact.active { background: #e11d48; }
    .toggle-handle { width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .ios-toggle-compact.active .toggle-handle { left: 25px; }

    /* FOOTER */
    .slim-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 25px; padding-top: 25px; border-top: 3px solid #f1f5f9; }
    .btn-footer-cancel { padding: 14px 30px; background: #f1f5f9; border: none; border-radius: 14px; font-weight: 900; color: #1e293b; cursor: pointer; font-size: 0.9rem; }
    .btn-footer-save { 
      padding: 14px 50px; background: #0f172a; color: white; border: none; border-radius: 14px; 
      font-weight: 950; cursor: pointer; display: flex; align-items: center; gap: 12px; font-size: 1rem; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); transition: 0.2s;
    }
    .btn-footer-save:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px rgba(0,0,0,0.3); background: #1e293b; }
    .btn-footer-save:active { transform: translateY(0) scale(0.98); }
    .btn-footer-cancel:hover { background: #e2e8f0; transform: translateY(-2px); }
    .btn-footer-cancel:active { transform: translateY(0); }
  `]
})
export class ProductFormComponent {
  @Input() product: Partial<Product> = {};
  @Input() editingProduct: Product | null = null;
  @Input() isSaving = false;
  
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() uploadImage = new EventEmitter<any>();
  @Output() uploadVariantImage = new EventEmitter<{ event: any, vIdx: number, oIdx: number }>();

  addVariantGroup() {
    if (!this.product.variants) this.product.variants = [];
    this.product.variants.push({ name: '', options: [{ label: '', price: 0 }] });
  }

  removeVariantGroup(index: number) { this.product.variants?.splice(index, 1); }
  addOption(vIdx: number) { this.product.variants![vIdx].options.push({ label: '', price: 0 }); }
  removeOption(vIdx: number, oIdx: number) { this.product.variants![vIdx].options.splice(oIdx, 1); }
  addSpecification() { if (!this.product.specifications) this.product.specifications = []; this.product.specifications.push({ key: '', value: '' }); }
  removeSpecification(index: number) { this.product.specifications?.splice(index, 1); }
}
