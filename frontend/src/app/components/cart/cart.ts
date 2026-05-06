import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DataService } from '../../services/data.service';
import { CartItem, Settings } from '../../models/models';
import { LucideTrash2, LucidePlus, LucideMinus, LucideSend, LucideArrowLeft } from '@lucide/angular';

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
            <img [src]="item.product.imageUrl || 'https://via.placeholder.com/80'" class="item-img">
            <div class="item-details">
              <h4>{{ item.product.name }}</h4>
              <p class="item-price">$ {{ item.product.price | number }}</p>
            </div>
            <div class="quantity-controls">
              <button (click)="updateQty(item.product.id, item.quantity - 1)"><svg lucideMinus size="16"></svg></button>
              <span>{{ item.quantity }}</span>
              <button (click)="updateQty(item.product.id, item.quantity + 1)"><svg lucidePlus size="16"></svg></button>
            </div>
            <button class="remove-btn" (click)="remove(item.product.id)">
              <svg lucideTrash2 size="20"></svg>
            </button>
          </div>
        </div>

        <div class="cart-footer" *ngIf="items.length > 0">
          <div class="delivery-options">
            <h4>Método de entrega</h4>
            <div class="radio-group">
              <label class="radio-label" [class.selected]="deliveryMethod === 'pickup'">
                <input type="radio" name="delivery" value="pickup" [(ngModel)]="deliveryMethod">
                <span>Pasar a Recoger</span>
              </label>
              <label class="radio-label" [class.selected]="deliveryMethod === 'delivery'">
                <input type="radio" name="delivery" value="delivery" [(ngModel)]="deliveryMethod">
                <span>Domicilio (+$6,000)</span>
              </label>
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
          
          <button class="whatsapp-btn" (click)="sendOrder()">
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
    .back-link { background: transparent; color: var(--text-light); display: flex; align-items: center; gap: 8px; font-weight: 600; padding: 0; }
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
    .quantity-controls button { width: 32px; height: 32px; padding: 0; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .remove-btn { color: #ff5252; background: transparent; padding: 0; min-height: auto; }
    .cart-footer { margin-top: 30px; border-top: 2px solid rgba(0,0,0,0.1); padding-top: 20px; }
    
    .delivery-options { margin-bottom: 25px; }
    .delivery-options h4 { margin-bottom: 15px; color: var(--text-dark); }
    .radio-group { display: flex; flex-direction: column; gap: 10px; }
    .radio-label { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .radio-label:hover { background: #f8f9fa; }
    .radio-label.selected { border-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.05); }
    .radio-label input { margin: 0; width: 18px; height: 18px; accent-color: var(--primary-color); }
    .radio-label span { font-weight: 600; color: #555; font-size: 1.05rem; }
    
    .summary-box { background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #666; font-size: 1.1rem; }
    .total-row { display: flex; justify-content: space-between; font-size: 1.4rem; font-weight: 800; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc; }
    .total-amount { color: var(--primary-color); }
    
    .whatsapp-btn {
      width: 100%; background: #25d366; color: white; font-size: 1.1rem; height: 56px;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); border-radius: 12px; font-weight: 700;
    }
    .whatsapp-btn:hover { background: #20bd5a; transform: translateY(-2px); }
  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  totalPrice = 0;
  settings: Settings | null = null;
  storeSlug: string = '';

  deliveryMethod: 'pickup' | 'delivery' = 'pickup';
  deliveryFee = 6000;

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
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {
        this.router.navigate(['/']);
        return;
      }
      this.storeSlug = slug;
      
      this.dataService.getSettingsBySlug(slug).subscribe({
        next: (settings) => {
          this.settings = settings;
          if (settings.primaryColor) {
            // Extraer RGB para el fondo transparente del radio button
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
    });

    this.cartService.cartItems$.subscribe(items => {
      this.items = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }

  updateQty(id: number, qty: number) {
    this.cartService.updateQuantity(id, qty);
  }

  remove(id: number) {
    this.cartService.removeFromCart(id);
  }

  sendOrder() {
    if (this.settings) {
      const link = this.cartService.generateWhatsAppLink(this.settings, this.deliveryMethod, this.deliveryFee);
      if (link) {
        window.open(link, '_blank');
      }
    }
  }

  goBack() {
    this.router.navigate(['/', this.storeSlug]);
  }
}
