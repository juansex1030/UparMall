import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '@shared/models/models';

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" (click)="close.emit()" style="z-index: 10000; background: rgba(0,0,0,0.4);">
      <div class="glass-panel" (click)="$event.stopPropagation()" style="max-width: 600px; width: 95%; padding: 0; overflow: hidden; border-radius: 32px;">
        <div style="background: #0f172a; padding: 30px; color: white; position: relative;">
          <h3 style="margin: 0; font-weight: 950; font-size: 1.5rem;">Detalle del Pedido</h3>
          <p style="margin: 5px 0 0; opacity: 0.6; font-size: 0.85rem;">ID: {{ order.id }}</p>
          <button (click)="close.emit()" class="close-modal-btn" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div style="padding: 30px; max-height: 60vh; overflow-y: auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div class="info-card-mini">
              <label>CLIENTE</label>
              <div class="val">{{ order.customer_name }}</div>
              <div class="sub">{{ order.customer_phone }}</div>
            </div>
            <div class="info-card-mini">
              <label>MÉTODO DE PAGO</label>
              <div class="val" style="text-transform: capitalize;">{{ order.payment_method }}</div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <label style="display: block; font-size: 0.75rem; font-weight: 900; color: #94a3b8; margin-bottom: 15px; letter-spacing: 1px;">DIRECCIÓN DE ENTREGA</label>
            <div style="background: #f8fafc; padding: 15px 20px; border-radius: 16px; border: 1px solid #e2e8f0; color: #1e293b; font-weight: 700;">
              {{ order.customer_address || 'Recogida en tienda' }}
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <label style="display: block; font-size: 0.75rem; font-weight: 900; color: #94a3b8; margin-bottom: 15px; letter-spacing: 1px;">RESUMEN DE PRODUCTOS</label>
            <div *ngFor="let item of order.OrderItems" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 28px; height: 28px; background: #0f172a; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900;">{{ item.quantity }}</span>
                <span style="font-weight: 800; color: #0f172a;">{{ item.product_name }}</span>
              </div>
              <span style="font-weight: 900; color: #0f172a;">$ {{ item.price * item.quantity | number }}</span>
            </div>
          </div>

          <div *ngIf="order.notes" style="margin-bottom: 30px;">
            <label style="display: block; font-size: 0.75rem; font-weight: 900; color: #94a3b8; margin-bottom: 10px;">NOTAS ADICIONALES</label>
            <div style="font-style: italic; color: #64748b; font-size: 0.9rem;">"{{ order.notes }}"</div>
          </div>
        </div>

        <div style="padding: 25px 30px; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0;">
           <span style="color: #64748b; font-weight: 800;">Total a Recibir</span>
           <span style="font-size: 1.8rem; font-weight: 950; color: #0f172a; letter-spacing: -1px;">$ {{ order.total | number }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed; inset: 0; background: rgba(248, 250, 252, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .glass-panel { background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; }
    .close-modal-btn {
      position: absolute; top: 25px; right: 25px; 
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); 
      color: white; padding: 8px 16px; border-radius: 12px; font-weight: 800; 
      font-size: 0.85rem; cursor: pointer; transition: 0.2s;
    }
    .close-modal-btn:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
    .info-card-mini { background: #f8fafc; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; }
    .info-card-mini label { display: block; font-size: 0.65rem; font-weight: 900; color: #94a3b8; margin-bottom: 5px; }
    .info-card-mini .val { font-weight: 900; color: #0f172a; font-size: 1.1rem; }
    .info-card-mini .sub { font-size: 0.85rem; color: #64748b; font-weight: 700; }
  `]
})
export class OrderDetailModalComponent {
  @Input() order!: Order;
  @Output() close = new EventEmitter<void>();
}
