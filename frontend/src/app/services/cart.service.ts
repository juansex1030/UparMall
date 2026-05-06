import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartItem, Settings } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(product: Product, selectedOptions?: { [key: string]: any }) {
    const currentItems = this.cartItems.value;
    
    // Si tiene opciones, lo tratamos como un item único basado en esas opciones
    const optionsKey = selectedOptions ? JSON.stringify(selectedOptions) : '';
    const existingItem = currentItems.find(item => 
      item.product.id === product.id && 
      JSON.stringify(item.selectedOptions || {}) === optionsKey
    );

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { product, quantity: 1, selectedOptions }]);
    }
  }

  removeFromCart(productId: number, optionsKey?: string) {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => {
      const currentOptKey = JSON.stringify(item.selectedOptions || {});
      return !(item.product.id === productId && (!optionsKey || currentOptKey === optionsKey));
    });
    this.cartItems.next(updatedItems);
  }

  updateQuantity(productId: number, quantity: number, optionsKey?: string) {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => 
      item.product.id === productId && 
      JSON.stringify(item.selectedOptions || {}) === (optionsKey || '{}')
    );
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId, optionsKey);
      } else {
        this.cartItems.next([...currentItems]);
      }
    }
  }

  clearCart() {
    this.cartItems.next([]);
  }

  getItemTotalPrice(item: CartItem): number {
    const options = item.selectedOptions ? Object.values(item.selectedOptions) : [];
    const variantWithPrice = options.find((opt: any) => opt.price > 0);
    
    let price;
    if (variantWithPrice) {
      // Si hay variante con precio, sumamos solo los precios de las variantes
      price = options.reduce((acc, opt: any) => acc + (opt.price || 0), 0);
    } else {
      // Si no, usamos el precio base del producto
      price = item.product.price;
    }
    
    return price * item.quantity;
  }

  getTotalPrice() {
    return this.cartItems.value.reduce((total, item) => total + this.getItemTotalPrice(item), 0);
  }

  generateWhatsAppLink(settings: Settings, deliveryMethod: 'pickup' | 'delivery' = 'pickup', deliveryFee: number = 0) {
    const items = this.cartItems.value;
    if (items.length === 0) return null;

    const subtotal = this.getTotalPrice();
    const finalTotal = subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);

    let message = settings.welcomeMessage || '¡Hola! Quiero hacer un pedido.';
    message += '\n\n*Resumen de mi pedido:*\n';

    items.forEach(item => {
      message += `• ${item.quantity}x ${item.product.name}`;
      
      if (item.selectedOptions) {
        const opts = Object.entries(item.selectedOptions)
          .map(([key, opt]: [string, any]) => `${key}: ${opt.label}`)
          .join(', ');
        message += ` (${opts})`;
      }
      
      message += ` - $${this.getItemTotalPrice(item).toLocaleString()}\n`;
    });
    
    message += `\n*Subtotal: $${subtotal.toLocaleString()}*`;

    if (deliveryMethod === 'delivery') {
      message += `\n*Método: Envío a Domicilio (+$${deliveryFee.toLocaleString()})*`;
    } else {
      message += `\n*Método: Pasar a Recoger*`;
    }

    message += `\n\n*TOTAL A PAGAR: $${finalTotal.toLocaleString()}*`;

    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
