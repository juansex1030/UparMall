import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
      <div class="loyalty-header glass-panel">
        <div class="h-icon">
          <i class="fas fa-heart"></i>
        </div>
        <div>
          <h3>Fidelización de Clientes</h3>
          <p>Identifica a tus compradores más recurrentes para premiar su lealtad.</p>
        </div>
      </div>

      <div class="customers-grid">
        <div class="customer-card glass-panel" *ngFor="let customer of topCustomers; let i = index">
          <div class="rank-badge" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
            {{ i + 1 }}
          </div>
          <div class="customer-info">
            <h4 class="name">{{ customer.name }}</h4>
            <span class="phone">{{ customer.phone }}</span>
          </div>
          <div class="stats-row">
            <div class="stat">
              <span class="label">Pedidos</span>
              <span class="value">{{ customer.count }}</span>
            </div>
            <div class="stat">
              <span class="label">Inversión Total</span>
              <span class="value">$ {{ customer.total | number }}</span>
            </div>
          </div>
          <div class="card-footer">
            <a [href]="getPromoLink(customer)" target="_blank" class="btn-promo">
              <i class="fab fa-whatsapp"></i> Ofrecer Promoción
            </a>
          </div>
        </div>

        <div *ngIf="topCustomers.length === 0" class="empty-state glass-panel">
          <i class="fas fa-users-slash"></i>
          <h4>Aún no hay datos de clientes</h4>
          <p>Los clientes recurrentes aparecerán aquí cuando recibas pedidos.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loyalty-header { 
      display: flex; align-items: center; gap: 20px; padding: 30px; margin-bottom: 30px;
      background: white; border-radius: 24px; border: 1px solid #e2e8f0;
    }
    .h-icon { width: 56px; height: 56px; border-radius: 16px; background: #fff1f2; color: #e11d48; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .loyalty-header h3 { margin: 0; font-weight: 950; font-size: 1.5rem; letter-spacing: -0.5px; }
    .loyalty-header p { margin: 5px 0 0; color: #64748b; font-weight: 600; }

    .customers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .customer-card { 
      background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0;
      position: relative; transition: 0.3s;
    }
    .customer-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1); border-color: #e11d48; }

    .rank-badge { 
      position: absolute; top: -10px; right: -10px; width: 34px; height: 34px; border-radius: 10px;
      background: #0f172a; color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 0.9rem; border: 3px solid white;
    }
    .rank-badge.gold { background: #f59e0b; }
    .rank-badge.silver { background: #94a3b8; }
    .rank-badge.bronze { background: #b45309; }

    .customer-info { margin-bottom: 20px; }
    .name { margin: 0; font-weight: 950; font-size: 1.2rem; color: #0f172a; }
    .phone { font-size: 0.85rem; color: #64748b; font-weight: 700; }

    .stats-row { display: flex; gap: 20px; margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 16px; }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat .label { font-size: 0.65rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .stat .value { font-size: 1rem; font-weight: 950; color: #0f172a; }

    .btn-promo {
      width: 100%; height: 48px; border-radius: 14px; background: #25d366; color: white;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      font-weight: 850; text-decoration: none; transition: 0.2s;
    }
    .btn-promo:hover { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 8px 16px rgba(37, 211, 102, 0.2); }

    .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px; color: #94a3b8; }
    .empty-state i { font-size: 48px; margin-bottom: 20px; opacity: 0.3; }
    .empty-state h4 { margin: 0; color: #0f172a; font-weight: 900; }
  `]
})
export class LoyaltyComponent {
  @Input() orders: Order[] = [];

  get topCustomers() {
    const map = new Map<string, { name: string, phone: string, count: number, total: number }>();
    
    // Filtrar pedidos para no contar cancelados si se desea, pero usualmente fidelidad es quien compra
    this.orders.filter(o => o.status !== 'cancelado').forEach(o => {
      const key = o.customer_phone;
      if (!map.has(key)) {
        map.set(key, { name: o.customer_name, phone: o.customer_phone, count: 0, total: 0 });
      }
      const data = map.get(key)!;
      data.count++;
      data.total += o.total;
    });

    return Array.from(map.values())
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }

  getPromoLink(customer: any): string {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`¡Hola ${customer.name}! Gracias por ser uno de nuestros clientes más fieles en nuestra tienda de UparMall. Queremos regalarte un cupón de descuento especial por tu próxima compra. 🎁`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  }
}
