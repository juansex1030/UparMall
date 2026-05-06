import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartItem, Settings } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor() {
    this.loadCart();
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem('uparmall_cart', JSON.stringify(items));
  }

  private loadCart() {
    const saved = localStorage.getItem('uparmall_cart');
    if (saved) {
      try {
        this.cartItems.next(JSON.parse(saved));
      } catch (e) {
        console.error('Error cargando el carrito persistido', e);
      }
    }
  }

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
    this.saveCart(this.cartItems.value);
  }

  removeFromCart(productId: number, optionsKey?: string) {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => {
      const currentOptKey = JSON.stringify(item.selectedOptions || {});
      return !(item.product.id === productId && (!optionsKey || currentOptKey === optionsKey));
    });
    this.cartItems.next(updatedItems);
    this.saveCart(updatedItems);
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
        this.saveCart(this.cartItems.value);
      }
    }
  }

  clearCart() {
    this.cartItems.next([]);
    localStorage.removeItem('uparmall_cart');
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

  generateWhatsAppLink(settings: Settings, deliveryMethod: 'pickup' | 'delivery' = 'pickup', deliveryFee: number = 0, shippingInfo?: any) {
    const items = this.cartItems.value;
    if (items.length === 0) return null;

    const subtotal = this.getTotalPrice();
    const finalTotal = subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);
    const NL = '\n';

    // Escapes Unicode nativos de TypeScript — resueltos en compilación, sin dependencias de runtime
    const iconBox    = '\u{1F4E6}'; // 📦
    const iconTruck  = '\u{1F69A}'; // 🚚
    const iconPerson = '\u{1F464}'; // 👤
    const iconPin    = '\u{1F4CD}'; // 📍
    const iconHouse  = '\u{1F3E0}'; // 🏠
    const iconMobile = '\u{1F4F1}'; // 📱
    const iconStore  = '\u{1F3EA}'; // 🏪
    const iconCart   = '\u{1F6D2}'; // 🛒
    const iconMoney  = '\u{1F4B0}'; // 💰
    const iconCheck  = '\u{2705}';  // ✅

    const lines: string[] = [];

    lines.push(iconBox + ' NUEVO PEDIDO - ' + settings.businessName);
    lines.push('');

    if (deliveryMethod === 'delivery' && shippingInfo) {
      lines.push(iconTruck + ' DATOS DE ENVIO');
      lines.push(iconPerson + ' Cliente: ' + shippingInfo.name);
      lines.push(iconPin + ' Direccion: ' + shippingInfo.address);
      lines.push(iconHouse + ' Barrio/Edif: ' + shippingInfo.neighborhood);
      lines.push(iconMobile + ' Celular: ' + shippingInfo.phone);
      lines.push('');
    } else {
      lines.push(iconStore + ' METODO: Pasar a Recoger en tienda');
      lines.push('');
    }

    lines.push(iconCart + ' PRODUCTOS');

    items.forEach(item => {
      let line = '• ' + item.quantity + 'x ' + item.product.name;
      if (item.selectedOptions) {
        const opts = Object.entries(item.selectedOptions)
          .map(([key, opt]: [string, any]) => key + ': ' + opt.label)
          .join(', ');
        line += ' (' + opts + ')';
      }
      line += ' - $' + this.getItemTotalPrice(item).toLocaleString('es-CO');
      lines.push(line);
    });

    lines.push('');
    lines.push(iconMoney + ' RESUMEN');
    lines.push('Subtotal: $' + subtotal.toLocaleString('es-CO'));

    if (deliveryMethod === 'delivery') {
      lines.push('Envio: $' + deliveryFee.toLocaleString('es-CO'));
    }

    lines.push('');
    lines.push(iconCheck + ' TOTAL A PAGAR: $' + finalTotal.toLocaleString('es-CO'));

    const message = lines.join(NL);

    return 'https://wa.me/' + settings.whatsappNumber + '?text=' + encodeURIComponent(message);
  }
}
