import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, Settings } from '@shared/models/models';

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" (click)="close.emit()" style="z-index: 10000; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
      <div class="glass-panel main-modal-container" (click)="$event.stopPropagation()" style="max-width: 700px; width: 95%; padding: 0; overflow: hidden; border-radius: 24px; background: #fff;">
        
        <!-- Modal Header (Web View) -->
        <div class="modal-header no-print" style="background: #0f172a; padding: 25px 30px; color: white; position: relative; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; font-weight: 950; font-size: 1.4rem; letter-spacing: -0.5px;">Detalle del Pedido</h3>
            <p style="margin: 4px 0 0; opacity: 0.6; font-size: 0.8rem; font-weight: 700;">Gestión de comprobante de venta</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button (click)="printInvoice()" class="btn-print" title="Imprimir Factura">
              <i class="fas fa-print"></i> <span>Imprimir</span>
            </button>
            <button (click)="close.emit()" class="btn-close-x">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Invoice Content Area (Scrollable in web, full in print) -->
        <div class="invoice-scroll-area" style="max-height: 70vh; overflow-y: auto; padding: 40px;">
          
          <!-- REAL INVOICE LAYOUT -->
          <div id="printable-invoice" class="invoice-container">
            <!-- Store Header -->
            <div class="invoice-header">
              <div class="store-brand">
                <img [src]="settings?.logoUrl || '/assets/logo-uparmall.png'" alt="Logo" class="invoice-logo">
                <div class="store-info">
                  <h1 class="store-name">{{ settings?.businessName || 'UparMall Store' }}</h1>
                  <p class="store-nit" *ngIf="settings?.nit">NIT: {{ settings?.nit }}</p>
                  <p class="store-address" *ngIf="settings?.address">{{ settings?.address }}</p>
                  <p class="store-contact">WhatsApp: {{ settings?.whatsappNumber }}</p>
                </div>
              </div>
              <div class="invoice-meta">
                <div class="invoice-badge">PEDIDO #{{ order.id }}</div>
                <div class="invoice-date">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            </div>

            <div class="invoice-divider"></div>

            <!-- Customer & Payment Info -->
            <div class="invoice-grid">
              <div class="invoice-section">
                <label>CLIENTE</label>
                <div class="info-val">{{ order.customer_name }}</div>
                <div class="info-sub">{{ order.customer_phone }}</div>
              </div>
              <div class="invoice-section">
                <label>MÉTODO DE PAGO</label>
                <div class="info-val text-capitalize">{{ order.payment_method }}</div>
                <div class="info-sub" *ngIf="order.payment_method === 'contraentrega'">Pago al recibir</div>
              </div>
            </div>

            <div class="invoice-section full-width">
              <label>DIRECCIÓN DE ENTREGA</label>
              <div class="info-val">{{ order.customer_address || 'Recogida en tienda' }}</div>
            </div>

            <div class="invoice-divider"></div>

            <!-- Items Table -->
            <div class="items-section">
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Producto / Descripción</th>
                    <th class="text-right">Precio</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of order.OrderItems">
                    <td class="qty-col">{{ item.quantity }}</td>
                    <td class="product-col">
                      <div class="p-name">{{ item.product_name }}</div>
                      <!-- Add options if available -->
                      <div class="p-options" *ngIf="item.options">
                         <span *ngFor="let opt of getOptionsArray(item.options)">
                           {{ opt.key }}: {{ opt.val }}
                         </span>
                      </div>
                    </td>
                    <td class="text-right">$ {{ item.price | number }}</td>
                    <td class="text-right">$ {{ item.price * item.quantity | number }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer Totals -->
            <div class="invoice-footer">
              <div class="notes-area">
                <div *ngIf="order.notes" style="margin-bottom: 15px;">
                  <label>NOTAS DEL PEDIDO</label>
                  <p>"{{ order.notes }}"</p>
                </div>
                <div *ngIf="settings?.guaranteeTerms">
                  <label>TÉRMINOS DE GARANTÍA</label>
                  <p style="font-size: 0.75rem; white-space: pre-line;">{{ settings?.guaranteeTerms }}</p>
                </div>
              </div>
              <div class="totals-area">
                <div class="total-row">
                   <span>Subtotal</span>
                   <span>$ {{ getSubtotal() | number }}</span>
                </div>
                <div class="total-row main-total">
                   <span>TOTAL A PAGAR</span>
                   <span>$ {{ order.total | number }}</span>
                </div>
              </div>
            </div>

            <div class="invoice-thanks">
              <p>¡Gracias por tu compra!</p>
              <p class="powered-by">Generado por UparMall.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    
    /* Invoice Styles */
    .invoice-container { font-family: 'Inter', sans-serif; color: #1e293b; background: white; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .store-brand { display: flex; align-items: center; gap: 20px; }
    .invoice-logo { width: 70px; height: 70px; border-radius: 14px; object-fit: contain; background: #f8fafc; padding: 5px; border: 1px solid #e2e8f0; }
    .store-name { margin: 0; font-size: 1.5rem; font-weight: 950; letter-spacing: -1px; color: #0f172a; }
    .store-nit { margin: 2px 0; font-size: 0.9rem; font-weight: 800; color: #1e293b; }
    .store-address { margin: 2px 0; font-size: 0.85rem; color: #64748b; font-weight: 600; }
    .store-contact { margin: 0; font-size: 0.85rem; color: #0f172a; font-weight: 800; }
    
    .invoice-meta { text-align: right; }
    .invoice-badge { background: #0f172a; color: white; padding: 6px 12px; border-radius: 8px; font-weight: 900; font-size: 0.8rem; margin-bottom: 5px; display: inline-block; }
    .invoice-date { font-size: 0.85rem; color: #64748b; font-weight: 700; }
    
    .invoice-divider { height: 1px; background: #e2e8f0; margin: 25px 0; }
    
    .invoice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
    .invoice-section { margin-bottom: 15px; }
    .invoice-section label { display: block; font-size: 0.7rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase; }
    .info-val { font-weight: 800; color: #0f172a; font-size: 1rem; }
    .info-sub { font-size: 0.85rem; color: #64748b; font-weight: 600; }
    .text-capitalize { text-transform: capitalize; }
    .full-width { grid-column: span 2; }
    
    .invoice-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .invoice-table th { text-align: left; padding: 12px 10px; border-bottom: 2px solid #0f172a; font-size: 0.75rem; font-weight: 950; color: #0f172a; text-transform: uppercase; }
    .invoice-table td { padding: 15px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .qty-col { width: 50px; font-weight: 900; }
    .product-col { font-weight: 800; }
    .p-options { font-size: 0.75rem; color: #64748b; margin-top: 4px; font-weight: 600; display: flex; gap: 10px; }
    .text-right { text-align: right !important; }
    
    .invoice-footer { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; margin-top: 30px; }
    .notes-area { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px dashed #cbd5e1; }
    .notes-area p { margin: 0; font-size: 0.85rem; color: #475569; font-style: italic; }
    
    .totals-area { display: flex; flex-direction: column; gap: 10px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 700; color: #64748b; }
    .main-total { margin-top: 10px; padding-top: 15px; border-top: 2px solid #0f172a; color: #0f172a; font-size: 1.2rem; font-weight: 950; }
    
    .invoice-thanks { text-align: center; margin-top: 50px; }
    .invoice-thanks p { margin: 5px 0; font-weight: 800; color: #64748b; font-size: 0.9rem; }
    .powered-by { font-size: 0.7rem !important; opacity: 0.5; margin-top: 15px !important; font-weight: 700 !important; }
    
    /* Button styles */
    .btn-print { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
    .btn-print:hover { background: #2563eb; transform: scale(1.05); }
    .btn-close-x { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-close-x:hover { background: rgba(255,255,255,0.2); }

    /* PRINT STYLES */
    @media print {
      body * { visibility: hidden; }
      #printable-invoice, #printable-invoice * { visibility: visible; }
      #printable-invoice { 
        position: absolute; left: 0; top: 0; width: 100%; 
        padding: 0 !important; margin: 0 !important;
      }
      .no-print { display: none !important; }
      .invoice-scroll-area { max-height: none !important; overflow: visible !important; padding: 0 !important; }
      .loading-overlay { background: white !important; backdrop-filter: none !important; }
      .main-modal-container { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; }
    }
  `]
})
export class OrderDetailModalComponent {
  @Input() order!: Order;
  @Input() settings: Settings | null = null;
  @Output() close = new EventEmitter<void>();

  getOptionsArray(options: any): {key: string, val: string}[] {
    if (!options) return [];
    return Object.keys(options).map(key => ({
      key,
      val: options[key].label || options[key]
    }));
  }

  getSubtotal(): number {
    return (this.order.OrderItems || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  printInvoice() {
    window.print();
  }
}
