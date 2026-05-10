import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '@shared/models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
      <div class="glass-panel" style="padding: 0; overflow: hidden;">
        <div class="orders-header">
          <div class="h-title-group">
            <div class="h-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3>Gestión de Pedidos</h3>
          </div>
          <button class="btn-action btn-light" (click)="refresh.emit()">
            <i class="fas fa-sync-alt"></i> <span>Actualizar</span>
          </button>
        </div>

        <!-- Vista de Escritorio (Tabla) -->
        <div class="table-container desktop-only">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Cliente / Contacto</th>
                <th>Fecha / Hora</th>
                <th>Total Pedido</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td>
                  <div class="client-cell">
                    <span class="c-name">{{ order.customer_name }}</span>
                    <span class="c-phone">📱 {{ order.customer_phone }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-cell">
                    {{ order.created_at | date:'dd MMM, yyyy' }}
                    <span class="time">⏰ {{ order.created_at | date:'HH:mm' }}</span>
                  </div>
                </td>
                <td>
                  <span class="price-val">$ {{ order.total | number }}</span>
                </td>
                <td>
                  <select [value]="order.status" (change)="onStatusChange(order, $event)" class="status-pill-select" [attr.data-status]="order.status">
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="confirmado">✅ Confirmado</option>
                    <option value="en_camino">🛵 En Camino</option>
                    <option value="entregado">🏠 Entregado</option>
                    <option value="cancelado">❌ Cancelado</option>
                  </select>
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="btn-circle view" (click)="viewDetails.emit(order)"><i class="fas fa-eye"></i></button>
                    <a [href]="'https://wa.me/' + cleanPhone(order.customer_phone)" target="_blank" class="btn-circle wa"><i class="fab fa-whatsapp"></i></a>
                    <button class="btn-circle del" (click)="delete.emit(order)"><i class="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista Móvil (Cards) -->
        <div class="orders-mobile-list mobile-only">
          <div *ngFor="let order of orders" class="order-mobile-card">
            <div class="card-top">
              <div class="card-client">
                <span class="m-name">{{ order.customer_name }}</span>
                <span class="m-date">{{ order.created_at | date:'dd MMM, HH:mm' }}</span>
              </div>
              <div class="card-price">$ {{ order.total | number }}</div>
            </div>
            
            <div class="card-mid">
              <select [value]="order.status" (change)="onStatusChange(order, $event)" class="status-pill-select m-status" [attr.data-status]="order.status">
                <option value="pendiente">⏳ Pendiente</option>
                <option value="confirmado">✅ Confirmado</option>
                <option value="en_camino">🛵 En Camino</option>
                <option value="entregado">🏠 Entregado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>

            <div class="card-actions">
              <button class="btn-m-action view" (click)="viewDetails.emit(order)">
                <i class="fas fa-eye"></i> Detalles
              </button>
              <a [href]="'https://wa.me/' + cleanPhone(order.customer_phone)" target="_blank" class="btn-m-action wa">
                <i class="fab fa-whatsapp"></i> Chat
              </a>
              <button class="btn-m-action del" (click)="delete.emit(order)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="orders.length === 0" class="empty-state">
           <div class="empty-icon"><i class="fas fa-clipboard-check"></i></div>
           <h4>Sin pedidos aún</h4>
           <p>Tus pedidos aparecerán aquí automáticamente.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-panel { background: white; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; width: 100%; }
    
    .orders-header { padding: 20px 25px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .h-title-group { display: flex; align-items: center; gap: 15px; }
    .h-icon { width: 40px; height: 40px; border-radius: 12px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; }
    .h-title-group h3 { margin: 0; font-weight: 950; font-size: 1.3rem; letter-spacing: -0.5px; }

    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { background: #f8fafc; padding: 16px 25px; text-align: left; font-size: 0.7rem; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .admin-table td { padding: 20px 25px; border-top: 1px solid #f1f5f9; }

    .client-cell { display: flex; flex-direction: column; gap: 4px; }
    .c-name { font-weight: 900; color: #0f172a; font-size: 0.95rem; }
    .c-phone { color: #64748b; font-size: 0.8rem; font-weight: 700; }
    
    .date-cell { font-size: 0.9rem; color: #334155; font-weight: 700; display: flex; flex-direction: column; }
    .date-cell .time { color: #94a3b8; font-size: 0.75rem; }
    
    .price-val { font-weight: 950; color: #1a1a1a; font-size: 1.05rem; }

    .status-pill-select {
      appearance: none; padding: 8px 30px 8px 12px; border-radius: 100px; border: none; font-size: 0.8rem; font-weight: 900; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center;
    }
    .status-pill-select[data-status="pendiente"] { background-color: #fef3c7; color: #92400e; }
    .status-pill-select[data-status="confirmado"] { background-color: #dcfce7; color: #166534; }
    .status-pill-select[data-status="en_camino"] { background-color: #dbeafe; color: #1e40af; }
    .status-pill-select[data-status="entregado"] { background-color: #f1f5f9; color: #475569; }
    .status-pill-select[data-status="cancelado"] { background-color: #fee2e2; color: #991b1b; }

    .actions-cell { display: flex; gap: 8px; }
    .btn-circle { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; text-decoration: none; }
    .btn-circle:hover { transform: scale(1.1); background: #0f172a; color: white; }
    .btn-circle.wa:hover { background: #22c55e; border-color: #22c55e; }
    .btn-circle.del:hover { background: #ef4444; border-color: #ef4444; }

    /* MOBILE CARDS */
    .orders-mobile-list { display: flex; flex-direction: column; gap: 15px; padding: 15px; }
    .order-mobile-card { background: #f8fafc; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
    .card-client { display: flex; flex-direction: column; gap: 4px; }
    .m-name { font-weight: 950; font-size: 1.1rem; color: #0f172a; }
    .m-date { font-size: 0.75rem; color: #64748b; font-weight: 800; }
    .card-price { font-weight: 950; color: #1a1a1a; font-size: 1.2rem; }
    
    .card-mid { margin-bottom: 20px; }
    .m-status { width: 100%; height: 44px; font-size: 0.9rem; }

    .card-actions { display: flex; gap: 10px; }
    .btn-m-action { flex: 1; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; color: #475569; }
    .btn-m-action.wa { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .btn-m-action.view { background: #eff6ff; color: #1e40af; border-color: #dbeafe; }
    .btn-m-action.del { width: 44px; flex: none; background: #fee2e2; color: #ef4444; border: none; }

    .empty-state { text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .empty-icon { width: 64px; height: 64px; border-radius: 50%; background: #f8fafc; color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .empty-state h4 { margin: 0; font-weight: 950; color: #0f172a; }
    .empty-state p { margin: 0; font-size: 0.9rem; color: #64748b; font-weight: 600; }

    .btn-action { padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; transition: 0.2s; }
    .btn-action:hover { background: #0f172a; color: white; border-color: #0f172a; }

    .desktop-only { display: block; }
    .mobile-only { display: none; }

    @media (max-width: 900px) {
      .desktop-only { display: none; }
      .mobile-only { display: block; }
      .orders-header h3 { font-size: 1.1rem; }
      .btn-action span { display: none; }
    }
  `]
})
export class OrdersComponent {
  @Input() orders: Order[] = [];
  @Output() statusChange = new EventEmitter<{order: Order, status: string}>();
  @Output() viewDetails = new EventEmitter<Order>();
  @Output() delete = new EventEmitter<Order>();
  @Output() refresh = new EventEmitter<void>();

  onStatusChange(order: Order, event: any) {
    this.statusChange.emit({ order, status: event.target.value });
  }

  cleanPhone(phone: string): string {
    return (phone || '').replace(/\D/g, '');
  }
}
