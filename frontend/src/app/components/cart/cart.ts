import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '@shared/services/cart.service';
import { DataService } from '@shared/services/data.service';
import { CartItem, Settings } from '@shared/models/models';
import { LucideTrash2, LucidePlus, LucideMinus, LucideSend, LucideArrowLeft } from '@lucide/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  template: `
    <div class="cart-container container">
      <div class="cart-nav">
        <button class="back-link" (click)="goBack()">
          <svg lucideArrowLeft size="18"></svg> Volver al catálogo
        </button>
      </div>
      <div class="cart-content glass">
        <h2>Mi Carrito</h2>
        
        <div class="empty-cart" *ngIf="items.length === 0">
          <p>Tu carrito está vacío</p>
          <button class="back-btn" (click)="goBack()">Ver productos</button>
        </div>

        <div class="cart-items" *ngIf="items.length > 0">
          <div class="cart-item" *ngFor="let item of items">
            <img [src]="getItemImage(item)" class="item-img">
            <div class="item-details">
              <h4>{{ item.product.name }}</h4>
              <p class="item-variants" *ngIf="item.selectedOptions && getOptionsKeys(item.selectedOptions).length">
                <span *ngFor="let key of getOptionsKeys(item.selectedOptions)">
                  {{ key }}: {{ item.selectedOptions[key]?.label }}
                </span>
              </p>
              <p class="item-price">$ {{ getItemUnitPrice(item) | number }}</p>
            </div>
            <div class="quantity-controls">
              <button (click)="updateQty(item.product.id, item.quantity - 1, item.selectedOptions)"><svg lucideMinus size="16"></svg></button>
              <span>{{ item.quantity }}</span>
              <button (click)="updateQty(item.product.id, item.quantity + 1, item.selectedOptions)"><svg lucidePlus size="16"></svg></button>
            </div>
            <button class="remove-btn" (click)="remove(item.product.id, item.selectedOptions)">
              <svg lucideTrash2 size="20"></svg>
            </button>
          </div>
        </div>

        <div class="cart-footer" *ngIf="items.length > 0">
          <div class="delivery-options">
            <h4>Método de entrega</h4>
            <div class="radio-group">
              <label class="radio-label" [class.selected]="deliveryMethod === 'pickup'">
                <input type="radio" name="delivery" value="pickup" [(ngModel)]="deliveryMethod" (change)="onDeliveryChange()">
                <span>Pasar a Recoger</span>
              </label>
              <label class="radio-label" [class.selected]="deliveryMethod === 'delivery'" *ngIf="settings?.hasDelivery">
                <input type="radio" name="delivery" value="delivery" [(ngModel)]="deliveryMethod" (change)="onDeliveryChange()">
                <span>Domicilio ({{ deliveryFee > 0 ? '+$' + (deliveryFee | number) : '¡Gratis!' }})</span>
              </label>
            </div>
          </div>

          <!-- Shipping Info Form (Only for delivery) -->
          <div class="shipping-form" *ngIf="deliveryMethod === 'delivery'">
            <h4>Datos de Envío</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre de quien recibe</label>
                <input type="text" [(ngModel)]="shippingInfo.name" placeholder="Ej: Juan Pérez">
              </div>
              <div class="form-group">
                <label>Número de contacto</label>
                <input type="tel" [(ngModel)]="shippingInfo.phone" placeholder="Ej: 300 123 4567">
              </div>
              <div class="form-group full-width">
                <label>Dirección completa</label>
                <input type="text" [(ngModel)]="shippingInfo.address" placeholder="Ej: Calle 123 #45-67">
              </div>
              <div class="form-group full-width">
                <label>Barrio / Edificio / Apto</label>
                <input type="text" [(ngModel)]="shippingInfo.neighborhood" placeholder="Ej: Barrio El Prado, Apto 402">
              </div>
            </div>
          </div>

          <!-- Pickup Info Form (Only for pickup) -->
          <div class="shipping-form" *ngIf="deliveryMethod === 'pickup'">
            <h4>Datos de quien retira</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre del cliente</label>
                <input type="text" [(ngModel)]="pickupName" placeholder="Nombre completo">
              </div>
              <div class="form-group">
                <label>Número de contacto</label>
                <input type="tel" [(ngModel)]="pickupPhone" placeholder="Ej: 300 123 4567">
              </div>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div class="delivery-options payment-section">
            <h4>Método de pago</h4>
            <div class="payment-grid">
              <button 
                class="payment-pill" 
                [class.active]="paymentMethod === 'efectivo'"
                (click)="paymentMethod = 'efectivo'">
                <span class="payment-icon">💵</span>
                <span>Efectivo</span>
              </button>
              <button 
                class="payment-pill" 
                [class.active]="paymentMethod === 'transferencia'"
                (click)="paymentMethod = 'transferencia'">
                <span class="payment-icon">🏦</span>
                <span>Transferencia</span>
              </button>
              <button 
                *ngIf="settings?.allowCashOnDelivery"
                class="payment-pill" 
                [class.active]="paymentMethod === 'contraentrega'"
                (click)="paymentMethod = 'contraentrega'">
                <span class="payment-icon">🚚</span>
                <span>Contraentrega</span>
              </button>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>$ {{ totalPrice | number }}</span>
            </div>
            <div class="summary-row" *ngIf="deliveryMethod === 'delivery'">
              <span>Domicilio:</span>
              <span>$ {{ deliveryFee | number }}</span>
            </div>
            <div class="total-row">
              <span>Total:</span>
              <span class="total-amount">$ {{ finalTotal | number }}</span>
            </div>
          </div>
          
          <button class="whatsapp-btn" (click)="sendOrder()" [disabled]="!isOrderValid() || isSending">
            <svg lucideSend size="20"></svg>
            Enviar Pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule, FormsModule, LucideTrash2, LucidePlus, LucideMinus, LucideSend, LucideArrowLeft],
  styles: [`
    .cart-container { padding: 20px 0; }
    .cart-nav { margin-bottom: 15px; }
    .back-link { background: transparent; color: var(--text-light); display: flex; align-items: center; gap: 8px; font-weight: 600; padding: 0 !important; min-height: unset !important; }
    .back-link:hover { color: var(--primary-color); }
    .cart-content { padding: 30px; }
    h2 { margin-bottom: 25px; text-align: center; }
    .empty-cart { text-align: center; padding: 40px 0; }
    .cart-item {
      display: flex; align-items: center; gap: 15px; padding: 15px 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
    .item-details { flex-grow: 1; }
    .quantity-controls { display: flex; align-items: center; gap: 10px; }
    .quantity-controls button { width: 32px; height: 32px; padding: 0 !important; min-height: unset !important; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: visible; }
    .remove-btn { color: #ff5252; background: transparent; padding: 0 !important; min-height: unset !important; overflow: visible; }
    .cart-footer { margin-top: 30px; border-top: 2px solid rgba(0,0,0,0.1); padding-top: 20px; padding-bottom: 40px; }
    
    .delivery-options { margin-bottom: 25px; }
    .delivery-options h4 { margin-bottom: 15px; color: var(--text-dark); font-weight: 700; }
    .radio-group { display: flex; flex-direction: column; gap: 10px; }
    .radio-label { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .radio-label:hover { background: #f8f9fa; }
    .radio-label.selected { border-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.05); border-width: 2px; }
    .radio-label input { margin: 0; width: 18px; height: 18px; accent-color: var(--primary-color); }
    .radio-label span { font-weight: 600; color: #555; font-size: 1.05rem; }
    
    /* Payment Methods */
    .payment-section { margin-top: 30px; }
    .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .payment-pill {
      background: white; border: 2px solid #eee; padding: 15px 5px !important; border-radius: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      cursor: pointer; transition: all 0.2s ease; min-height: unset !important;
    }
    .payment-pill.active { border-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.05); }
    .payment-icon { font-size: 1.5rem; }
    .payment-pill span:not(.payment-icon) { font-size: 0.8rem; font-weight: 700; color: #555; }
    .payment-pill.active span { color: var(--primary-color); }

    .summary-box { background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #666; font-size: 1.1rem; }
    .total-row { display: flex; justify-content: space-between; font-size: 1.4rem; font-weight: 800; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc; }
    .total-amount { color: var(--primary-color); }
    
    .whatsapp-btn {
      width: 100%; background: #25d366; color: white; font-size: 1.1rem; height: 56px;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); border-radius: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 0 !important; min-height: unset !important;
    }
    .whatsapp-btn:hover { background: #20bd5a; transform: translateY(-2px); }
    .whatsapp-btn:disabled { background: #ccc; opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

    /* Shipping Form */
    .shipping-form { margin-bottom: 25px; padding: 20px; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); }
    .shipping-form h4 { margin-bottom: 15px; color: #333; font-weight: 700; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #666; }
    .form-group input { 
      padding: 12px; border-radius: 10px; border: 1px solid #ddd; background: white;
      font-family: inherit; font-size: 0.95rem; transition: border-color 0.2s;
    }
    .form-group input:focus { border-color: var(--primary-color); outline: none; }

    @media (max-width: 600px) {
      .cart-container { padding: 10px 0; }
      .cart-content { padding: 20px 15px; margin-bottom: 20px; border-radius: 20px; }
      h2 { font-size: 1.5rem; margin-bottom: 20px; }
      
      .cart-item { gap: 12px; padding: 12px 0; }
      .item-img { width: 50px; height: 50px; border-radius: 10px; }
      .item-details h4 { font-size: 0.95rem; line-height: 1.2; }
      .item-price { font-size: 0.9rem; font-weight: 900; }
      
      .quantity-controls { gap: 8px; }
      .quantity-controls button { width: 30px; height: 30px; }
      
      .delivery-options h4 { font-size: 1rem; margin-bottom: 12px; }
      .radio-label { padding: 10px; }
      .radio-label span { font-size: 0.95rem; }
      
      .shipping-form { padding: 15px; }
      .form-grid { grid-template-columns: 1fr; gap: 12px; }
      .form-group.full-width { grid-column: span 1; }
      
      .payment-grid { grid-template-columns: 1fr; gap: 8px; }
      .payment-pill { 
        flex-direction: row; 
        padding: 14px 18px !important; 
        justify-content: flex-start; 
        gap: 15px; 
        border-radius: 14px;
      }
      .payment-icon { font-size: 1.2rem; }
      .payment-pill span:not(.payment-icon) { font-size: 0.9rem; }
      
      .summary-box { padding: 15px; margin-top: 20px; }
      .summary-row { font-size: 0.95rem; }
      .total-row { font-size: 1.25rem; }
      
      .whatsapp-btn { height: 60px; font-size: 1rem; border-radius: 16px; }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  totalPrice = 0;
  settings: Settings | null = null;
  storeSlug: string = '';

  deliveryMethod: 'pickup' | 'delivery' = 'pickup';
  deliveryFee = 0;
  shippingInfo = { name: '', address: '', neighborhood: '', phone: '' };
  pickupName = '';
  pickupPhone = '';
  paymentMethod: 'efectivo' | 'transferencia' | 'contraentrega' = 'efectivo';
  isSending = false;
  private _subs = new Subscription();

  get finalTotal() {
    return this.totalPrice + (this.deliveryMethod === 'delivery' ? this.deliveryFee : 0);
  }

  constructor(
    private cartService: CartService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._subs.add(this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {
        this.router.navigate(['/']);
        return;
      }
      this.storeSlug = slug;
      this.cartService.setStoreSlug(slug);
      
      this.dataService.getSettingsBySlug(slug).subscribe({
        next: (settings) => {
          this.settings = settings;
          this.deliveryFee = settings.deliveryFee || 0;
          
          // Ajustar método por defecto si la tienda no ofrece domicilio
          if (!settings.hasDelivery) {
            this.deliveryMethod = 'pickup';
          }

          if (settings.primaryColor) {
            const hex = settings.primaryColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
            document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
          }
        },
        error: (err) => console.error('Error cargando settings del carrito', err)
      });
    }));

    this._subs.add(this.cartService.cartItems$.subscribe(items => {
      this.items = items;
      this.totalPrice = this.cartService.getTotalPrice();
    }));
  }

  onDeliveryChange() {
    // Ya no reseteamos el método de pago para permitir contraentrega/pago en tienda en ambos casos
  }

  ngOnDestroy() {
    this._subs.unsubscribe();
  }

  getOptionsKey(options: any): string {
    return this.cartService.getOptionsKey(options);
  }

  getOptionsKeys(options: any): string[] {
    return Object.keys(options || {});
  }

  getItemUnitPrice(item: CartItem): number {
    return this.cartService.getItemUnitPrice(item);
  }

  getItemImage(item: CartItem): string {
    return this.cartService.getItemImage(item);
  }

  updateQty(id: number, qty: number, options: any = {}) {
    this.cartService.updateQuantity(id, qty, this.getOptionsKey(options));
  }

  remove(id: number, options: any = {}) {
    this.cartService.removeFromCart(id, this.getOptionsKey(options));
  }

  isShippingValid(): boolean {
    return !!(this.shippingInfo.name && this.shippingInfo.address && this.shippingInfo.neighborhood && this.shippingInfo.phone);
  }

  isOrderValid(): boolean {
    if (this.deliveryMethod === 'delivery') {
      return this.isShippingValid();
    } else {
      return !!(this.pickupName && this.pickupPhone);
    }
  }

  sendOrder() {
    if (this.isSending || !this.settings) return;
    this.isSending = true;

    // 1. Preparar datos para la base de datos
    const orderData = {
      storeId: this.settings.storeId,
      customerName: this.deliveryMethod === 'delivery' ? this.shippingInfo.name : this.pickupName,
      customerPhone: this.deliveryMethod === 'delivery' ? this.shippingInfo.phone : this.pickupPhone,
      customerAddress: this.deliveryMethod === 'delivery' 
        ? `${this.shippingInfo.address}, ${this.shippingInfo.neighborhood}` 
        : 'Recogida en tienda',
      total: this.finalTotal,
      paymentMethod: this.paymentMethod,
      notes: this.deliveryMethod === 'delivery' ? `Barrio: ${this.shippingInfo.neighborhood}` : '',
      items: this.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: this.getItemUnitPrice(item),
        quantity: item.quantity,
        options: item.selectedOptions
      }))
    };

    // 2. Guardar en la base de datos primero
    this.dataService.createOrder(orderData).subscribe({
      next: () => {
        // 3. Generar link y enviar a WhatsApp
        const link = this.cartService.generateWhatsAppLink(
          this.settings!,
          this.deliveryMethod,
          this.deliveryFee,
          this.deliveryMethod === 'delivery' ? this.shippingInfo : undefined,
          this.paymentMethod,
          this.deliveryMethod === 'pickup' ? this.pickupName : undefined
        );
        
        if (link) {
          console.log('Pedido guardado. Redirigiendo a WhatsApp:', link);
          this.cartService.clearCart();
          // Usamos window.open para mejor compatibilidad y evitar bloqueos
          window.open(link, '_blank');
        } else {
          console.error('No se pudo generar el enlace de WhatsApp (¿carrito vacío?)');
        }
        this.isSending = false;
      },
      error: (err: any) => {
        console.error('Error al guardar el pedido:', err);
        alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
        this.isSending = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/', this.storeSlug]);
  }
}
