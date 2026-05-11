import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../shared/services/data.service';

@Component({
  selector: 'app-master-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <!-- Master Stats -->
      <div class="stat-row">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <span class="stat-label">Tiendas Totales</span>
              <span class="stat-value">{{ safeStores.length }}</span>
            </div>
            <div style="width: 48px; height: 48px; border-radius: 14px; background: #eef2ff; color: #6366f1; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-store" style="font-size: 24px;"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <span class="stat-label">Ventas Globales</span>
              <span class="stat-value">{{ safeOrders.length }}</span>
            </div>
            <div style="width: 48px; height: 48px; border-radius: 14px; background: #f0fdf4; color: #22c55e; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-shopping-cart" style="font-size: 24px;"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions: Create User -->
      <div class="s-section" style="margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
           <h3 style="margin: 0; font-size: 1.5rem;">Alta de Nueva Tienda</h3>
           <span style="background: #0f172a; color: white; padding: 6px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 900;">Acceso Restringido</span>
        </div>
        
        <div class="create-store-form">
          <div class="form-grid">
            <div class="f-group">
              <label>Correo del Dueño</label>
              <input type="email" [(ngModel)]="newUserEmail" placeholder="ejemplo@correo.com" class="m-input">
            </div>
            <div class="f-group">
              <label>Contraseña Temporal (Opcional)</label>
              <input type="password" [(ngModel)]="newUserPassword" placeholder="Dejar vacío para 'UparMall2026*'" class="m-input">
            </div>
            <div class="f-group" style="display: flex; align-items: flex-end;">
              <button class="btn-create" [disabled]="isCreating || !newUserEmail" (click)="onCreateStore()">
                <i class="fas" [class.fa-plus]="!isCreating" [class.fa-spinner]="isCreating" [class.fa-spin]="isCreating" style="margin-right: 8px;"></i>
                {{ isCreating ? 'Creando...' : 'Dar de Alta' }}
              </button>
            </div>
          </div>
          
          <div *ngIf="message" [class.msg-success]="!isError" [class.msg-error]="isError" class="feedback-msg">
            <i class="fas" [class.fa-check-circle]="!isError" [class.fa-exclamation-circle]="isError" style="margin-right: 8px;"></i>
            {{ message }}
          </div>
        </div>
      </div>

      <!-- Global Stores Table -->
      <div class="s-section" style="margin-bottom: 40px; padding: 0; overflow: hidden;">
        <div style="padding: 25px; border-bottom: 1px solid #f1f5f9;">
          <h3 style="margin: 0; font-size: 1.3rem;">Directorio de Tiendas</h3>
        </div>
        <div class="table-wrapper">
          <table class="master-table">
            <thead>
              <tr>
                <th>Tienda</th>
                <th>Ruta (Slug)</th>
                <th>Administrador</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let store of safeStores">
                <td><span style="font-weight: 850;">{{ store.businessName || store.name }}</span></td>
                <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">/{{ store.slug }}</code></td>
                <td>{{ store.ownerEmail }}</td>
                <td>
                  <button class="btn-action btn-light" style="padding: 6px 12px; font-size: 0.8rem;" (click)="viewStore.emit(store.slug)">
                    <i class="fas fa-external-link-alt" style="margin-right: 6px;"></i> Visitar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Global Orders Table -->
      <div class="s-section" style="padding: 0; overflow: hidden;">
        <div style="padding: 25px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 1.3rem;">Ventas Recientes (Global)</h3>
          <button class="btn-action btn-light" (click)="refresh.emit()">
            <i class="fas fa-sync-alt" style="margin-right: 6px;"></i> Refrescar
          </button>
        </div>
        <div class="table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Tienda / Origen</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of safeOrders">
                <td>
                  <span style="background: #0f172a; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 900;">
                    {{ (order.Stores?.slug || 'TIENDA').toUpperCase() }}
                  </span>
                </td>
                <td><span style="font-weight: 800;">{{ order.customer_name || order.customerName }}</span></td>
                <td><span style="font-weight: 950;">$ {{ order.total | number }}</span></td>
                <td>{{ order.created_at | date:'dd/MM HH:mm' }}</td>
                <td>
                  <span class="badge" [attr.data-status]="order.status" 
                        style="font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; font-weight: 900;">
                    {{ order.status?.toUpperCase() }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="safeOrders.length === 0">
                <td colspan="5" style="text-align: center; padding: 60px;">No hay ventas registradas en el sistema.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .stat-card { background: white; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 2.5rem; font-weight: 950; color: #0f172a; margin-top: 8px; display: block; letter-spacing: -1px; }

    .s-section { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .s-section h3 { font-size: 1.75rem; font-weight: 950; letter-spacing: -1px; color: #0f172a; }

    .create-store-form { background: #f8fafc; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; }
    .form-grid { display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 20px; }
    .f-group label { display: block; font-size: 0.75rem; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 10px; }
    .m-input { width: 100%; padding: 14px 20px; border-radius: 12px; border: 2px solid #e2e8f0; font-size: 1rem; font-weight: 700; color: #0f172a; }
    .m-input:focus { outline: none; border-color: #0f172a; background: white; }
    
    .btn-create { width: 100%; background: #0f172a; color: white; padding: 14px; border: none; border-radius: 12px; font-weight: 850; cursor: pointer; transition: 0.2s; }
    .btn-create:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .btn-create:disabled { opacity: 0.5; cursor: not-allowed; }

    .feedback-msg { margin-top: 20px; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; }
    .msg-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .msg-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

    .table-wrapper { background: white; border-radius: 16px; overflow: hidden; }
    .master-table { width: 100%; border-collapse: collapse; }
    .master-table th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; }
    .master-table td { padding: 16px 24px; border-top: 1px solid #f1f5f9; font-weight: 700; color: #334155; }

    .admin-table { width: 100%; border-collapse: collapse; min-width: 800px; }
    .admin-table th { background: #f8fafc; padding: 20px 25px; text-align: left; font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; }
    .admin-table td { padding: 20px 25px; border-top: 1px solid #f1f5f9; }

    .btn-action {
      padding: 12px 24px; border-radius: 16px; font-weight: 700; font-size: 0.95rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid transparent; transition: 0.3s;
    }
    .btn-light { background: white; border-color: #e2e8f0; color: #64748b; }

    .badge { padding: 4px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; font-weight: 900; font-size: 0.65rem; }
  `]
})
export class MasterControlComponent {
  @Input() stores: any[] = [];
  @Input() orders: any[] = [];
  @Output() viewStore = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  newUserEmail = '';
  newUserPassword = '';
  isCreating = false;
  message = '';
  isError = false;

  constructor(private dataService: DataService) {}

  get safeStores() { return this.stores || []; }
  get safeOrders() { return this.orders || []; }

  onCreateStore() {
    if (!this.newUserEmail) return;
    
    this.isCreating = true;
    this.message = '';
    this.isError = false;

    this.dataService.createMasterStore(this.newUserEmail, this.newUserPassword).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.message = '¡Éxito! El usuario ha sido dado de alta correctamente.';
        this.newUserEmail = '';
        this.newUserPassword = '';
        this.refresh.emit();
      },
      error: (err) => {
        this.isCreating = false;
        this.isError = true;
        this.message = err.error?.message || 'Error al crear el usuario. Verifica si ya existe.';
      }
    });
  }
}
