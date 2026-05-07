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
        console.error('Error cargando el carrito persistido, limpiando...', e);
        localStorage.removeItem('uparmall_cart');
      }
    }
  }

  public getStableOptionsKey(options: any): string {
    if (!options) return '{}';
    const stable: any = {};
    Object.keys(options).sort().forEach(key => {
      stable[key] = options[key];
    });
    return JSON.stringify(stable);
  }

  addToCart(product: Product, selectedOptions?: { [key: string]: any }) {
    const currentItems = this.cartItems.value;
    const optionsKey = this.getStableOptionsKey(selectedOptions);

    // Ensure option prices are numbers
    const cleanOptions: any = {};
    if (selectedOptions) {
      Object.keys(selectedOptions).forEach(key => {
        cleanOptions[key] = {
          ...selectedOptions[key],
          price: Number(selectedOptions[key].price) || 0
        };
      });
    }

    const existingItem = currentItems.find(item =>
      item.product.id === product.id &&
      this.getStableOptionsKey(item.selectedOptions) === optionsKey
    );

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { product, quantity: 1, selectedOptions: cleanOptions }]);
    }
    this.saveCart(this.cartItems.value);
  }

  removeFromCart(productId: number, optionsKey?: string) {
    const currentItems = this.cartItems.value;
    const targetKey = optionsKey || '{}';
    const updatedItems = currentItems.filter(item => {
      const currentOptKey = this.getStableOptionsKey(item.selectedOptions);
      return !(item.product.id === productId && currentOptKey === targetKey);
    });
    this.cartItems.next(updatedItems);
    this.saveCart(updatedItems);
  }

  updateQuantity(productId: number, quantity: number, optionsKey?: string) {
    const currentItems = this.cartItems.value;
    const targetKey = optionsKey || '{}';
    const item = currentItems.find(item =>
      item.product.id === productId &&
      this.getStableOptionsKey(item.selectedOptions) === targetKey
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
    return this.getItemUnitPrice(item) * item.quantity;
  }

  getItemUnitPrice(item: CartItem): number {
    const options = item.selectedOptions ? Object.values(item.selectedOptions) : [];
    const variantPrices = options.map((opt: any) => Number(opt.price) || 0);
    const maxVariantPrice = Math.max(0, ...variantPrices);

    // The variant price is the TOTAL price. If set (>0), it wins.
    return maxVariantPrice > 0 ? maxVariantPrice : (item.product.price || 0);
  }

  getItemImage(item: CartItem): string {
    if (item.selectedOptions) {
      const optionsWithImage = Object.values(item.selectedOptions).filter((opt: any) => opt.imageUrl);
      if (optionsWithImage.length > 0) {
        return (optionsWithImage[optionsWithImage.length - 1] as any).imageUrl;
      }
    }
    return item.product.imageUrl || 'https://via.placeholder.com/100';
  }

  getOptionsKey(options: any): string {
    return JSON.stringify(options || {});
  }

  getTotalPrice() {
    return this.cartItems.value.reduce((total, item) => total + this.getItemTotalPrice(item), 0);
  }

  generateWhatsAppLink(
    settings: Settings,
    deliveryMethod: 'pickup' | 'delivery' = 'pickup',
    deliveryFee: number = 0,
    shippingInfo?: any,
    paymentMethod: string = 'efectivo',
    pickupName?: string
  ) {
    const items = this.cartItems.value;
    if (items.length === 0) return null;

    const subtotal = this.getTotalPrice();
    const finalTotal = subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);
    const NL = '\n';

    const lines: string[] = [];

    lines.push('NUEVO PEDIDO - ' + settings.businessName);
    lines.push('');

    if (deliveryMethod === 'delivery' && shippingInfo) {
      lines.push('DATOS DE ENVIO');
      lines.push('Cliente: ' + shippingInfo.name);
      lines.push('Direccion: ' + shippingInfo.address);
      lines.push('Barrio/Edif: ' + shippingInfo.neighborhood);
      lines.push('Celular: ' + shippingInfo.phone);
      lines.push('');
    } else {
      lines.push('METODO: Pasar a Recoger en tienda');
      if (pickupName) {
        lines.push('Persona que retira: ' + pickupName);
      }
      lines.push('');
    }

    const paymentLabels: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'contraentrega': 'Contraentrega'
    };
    lines.push('METODO DE PAGO: ' + (paymentLabels[paymentMethod] || paymentMethod));
    lines.push('');

    lines.push('PRODUCTOS');

    items.forEach(item => {
      let line = item.quantity + 'x ' + item.product.name;
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
    lines.push('RESUMEN');
    lines.push('Subtotal: $' + subtotal.toLocaleString('es-CO'));

    if (deliveryMethod === 'delivery') {
      lines.push('Envio: $' + deliveryFee.toLocaleString('es-CO'));
    }

    lines.push('');
    lines.push('TOTAL A PAGAR: $' + finalTotal.toLocaleString('es-CO'));

    const message = lines.join(NL);

    let phone = settings.whatsappNumber.replace(/\D/g, '');
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  }
}
