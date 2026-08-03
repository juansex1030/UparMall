import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '@shared/services/data.service';
import { Product, Table, Order, Settings } from '@shared/models/models';

@Component({
  selector: 'app-pos-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h2 class="text-xl font-bold text-neutral-900">Mesa: {{ table.name }}</h2>
            <p class="text-sm text-neutral-500">
              Estado: <span class="font-semibold" [ngClass]="{'text-green-600': table.status === 'free', 'text-red-600': table.status === 'occupied'}">{{ getStatusText(table.status) }}</span>
              <span *ngIf="currentOrder"> | Pedido #{{ currentOrder.id }}</span>
            </p>
          </div>
          <button (click)="closeModal(false)" class="p-2 text-neutral-400 hover:text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Lado Izquierdo: Catálogo de Productos -->
          <div class="flex-1 flex flex-col border-r border-neutral-200 bg-neutral-50/50">
            <!-- Buscador y Categorías -->
            <div class="p-4 border-b border-neutral-200 bg-white">
              <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar plato o bebida..." class="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none mb-3">
              <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button *ngFor="let cat of categories" 
                        (click)="selectedCategory = cat"
                        class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                        [ngClass]="selectedCategory === cat ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
                  {{ cat }}
                </button>
              </div>
            </div>

            <!-- Grilla de Productos -->
            <div class="flex-1 overflow-y-auto p-4">
              <div *ngIf="isLoading" class="text-center py-10 text-neutral-500">Cargando pedido actual...</div>
              
              <div *ngIf="!isLoading" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let product of filteredProducts()" 
                     (click)="addToCart(product)"
                     class="bg-white border border-neutral-200 rounded-xl p-3 cursor-pointer hover:border-neutral-400 hover:shadow-md transition-all flex flex-col h-full">
                  <div class="w-full h-24 bg-neutral-100 rounded-lg mb-3 bg-cover bg-center" [style.background-image]="'url(' + (product.imageUrl || '/assets/placeholder.png') + ')'"></div>
                  <div class="flex-1">
                    <h3 class="font-bold text-sm text-neutral-900 leading-tight mb-1">{{ product.name }}</h3>
                    <p class="text-xs text-neutral-500 line-clamp-2 mb-2">{{ product.description || 'Sin descripción' }}</p>
                  </div>
                  <div class="font-bold text-neutral-900">{{ product.price | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lado Derecho: La Comanda (Carrito) -->
          <div class="w-96 flex flex-col bg-white">
            <div class="p-4 border-b border-neutral-200 bg-neutral-50 font-bold text-lg text-neutral-800 flex justify-between items-center">
              <span>La Comanda</span>
              <span class="text-sm font-normal text-neutral-500 bg-white px-2 py-1 rounded-md border border-neutral-200">{{ cart.length }} ítems (nuevos)</span>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <!-- Productos ya pedidos (Solo lectura visual rápida) -->
              <div *ngIf="currentOrder && currentOrder.OrderItems && currentOrder.OrderItems.length > 0" class="mb-6">
                <h4 class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">En Cocina / Servidos</h4>
                <div *ngFor="let item of currentOrder.OrderItems" class="flex justify-between items-start py-2 border-b border-neutral-100 opacity-60">
                  <div class="flex-1 pr-2">
                    <div class="font-medium text-sm">{{ item.quantity }}x {{ item.product_name }}</div>
                    <div *ngIf="item.notes" class="text-xs text-neutral-500 mt-0.5">Nota: {{ item.notes }}</div>
                  </div>
                  <div class="text-sm font-medium">{{ item.price * item.quantity | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
              </div>

              <!-- Nuevos Productos -->
              <div>
                <h4 class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3" *ngIf="cart.length > 0">Nuevos Pedidos</h4>
                <div *ngFor="let item of cart; let i = index" class="bg-blue-50/30 border border-blue-100 rounded-lg p-3 mb-3 relative group">
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-bold text-neutral-900 text-sm flex-1 pr-4">{{ item.productName }}</div>
                    <div class="font-bold text-sm">{{ item.price * item.quantity | currency:'USD':'symbol':'1.0-0' }}</div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center border border-neutral-300 rounded-lg bg-white">
                      <button (click)="updateQuantity(i, -1)" class="px-2 py-1 text-neutral-500 hover:bg-neutral-100 rounded-l-lg">-</button>
                      <span class="px-3 text-sm font-medium">{{ item.quantity }}</span>
                      <button (click)="updateQuantity(i, 1)" class="px-2 py-1 text-neutral-500 hover:bg-neutral-100 rounded-r-lg">+</button>
                    </div>
                    <button (click)="removeFromCart(i)" class="text-red-500 hover:text-red-700 text-sm font-medium">Quitar</button>
                  </div>
                  
                  <input type="text" [(ngModel)]="item.notes" placeholder="Notas (Ej. Sin cebolla)" class="w-full mt-2 text-xs px-2 py-1.5 bg-white border border-neutral-200 rounded outline-none focus:border-blue-300">
                </div>
                
                <div *ngIf="cart.length === 0" class="text-center py-8 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl">
                  Selecciona productos del menú<br>para añadir a la comanda.
                </div>
              </div>
            </div>

            <!-- Footer: Totales y Acciones -->
            <div class="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
              <div class="flex justify-between text-sm text-neutral-500">
                <span>Total Anterior:</span>
                <span>{{ (currentOrder?.total || 0) | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between text-sm text-blue-600 font-medium">
                <span>Nuevos Ítems:</span>
                <span>{{ getCartTotal() | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between text-xl font-black text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Gran Total:</span>
                <span>{{ (Number(currentOrder?.total || 0) + getCartTotal()) | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              
              <div class="grid grid-cols-2 gap-2 pt-2">
                <button (click)="requestBill()" *ngIf="currentOrder" class="py-3 px-4 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition-colors">
                  Pedir Cuenta
                </button>
                <button (click)="sendToKitchen()" [disabled]="cart.length === 0 || isSending" [class.col-span-2]="!currentOrder" class="py-3 px-4 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center">
                  <svg *ngIf="isSending" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSending ? 'Enviando...' : 'Enviar a Cocina' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PosOrderModalComponent implements OnInit {
  @Input() table!: Table;
  @Input() products: Product[] = [];
  @Input() settings!: Settings;
  @Output() close = new EventEmitter<boolean>(); // true if changed

  categories: string[] = ['Todos'];
  selectedCategory: string = 'Todos';
  searchTerm: string = '';
  
  cart: any[] = [];
  currentOrder: Order | null = null;
  isLoading = false;
  isSending = false;
  Number = Number; // para template

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.extractCategories();
    if (this.table.current_order_id) {
      this.loadCurrentOrder(this.table.current_order_id);
    }
  }

  extractCategories() {
    const cats = this.products.map(p => p.category).filter(c => c && c.trim() !== '') as string[];
    this.categories = ['Todos', ...new Set(cats)];
  }

  filteredProducts() {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'Todos' || p.category === this.selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                         (p.description && p.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchCat && matchSearch && p.isActive;
    });
  }

  loadCurrentOrder(orderId: string) {
    this.isLoading = true;
    this.dataService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.currentOrder = order;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando orden actual', err);
        this.isLoading = false;
      }
    });
  }

  addToCart(product: Product) {
    this.cart.unshift({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      notes: '',
      options: {}
    });
  }

  updateQuantity(index: number, delta: number) {
    const newVal = this.cart[index].quantity + delta;
    if (newVal > 0) {
      this.cart[index].quantity = newVal;
    } else {
      this.removeFromCart(index);
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getStatusText(status: string) {
    if (status === 'free') return 'Libre';
    if (status === 'occupied') return 'Ocupada';
    if (status === 'pending_payment') return 'Por pagar';
    return status;
  }

  closeModal(changed: boolean) {
    this.close.emit(changed);
  }

  sendToKitchen() {
    if (this.cart.length === 0) return;
    this.isSending = true;

    if (this.currentOrder) {
      // Add items to existing order
      this.dataService.addOrderItems(this.currentOrder.id, this.cart).subscribe({
        next: () => {
          this.isSending = false;
          this.closeModal(true);
        },
        error: (err) => {
          alert('Error al añadir productos a la comanda');
          this.isSending = false;
        }
      });
    } else {
      // Create new order
      const newOrderPayload = {
        storeId: this.settings.storeId,
        customerName: 'Mesa ' + this.table.name,
        customerPhone: 'N/A',
        tableId: this.table.id,
        total: this.getCartTotal(),
        paymentMethod: 'EFECTIVO', // Placeholder hasta el pago real
        items: this.cart
      };

      this.dataService.createOrder(newOrderPayload).subscribe({
        next: (createdOrder) => {
          // Update table status to occupied and link order
          this.dataService.updateTableStatus(this.table.id, 'occupied', createdOrder.id).subscribe({
            next: () => {
              this.isSending = false;
              this.closeModal(true);
            },
            error: () => {
              this.isSending = false;
              this.closeModal(true); // Se creó la orden pero falló enlazar la mesa visualmente
            }
          });
        },
        error: (err) => {
          alert('Error al crear la comanda');
          this.isSending = false;
        }
      });
    }
  }

  requestBill() {
    if (!confirm('¿Seguro que deseas pedir la cuenta para esta mesa?')) return;
    
    this.dataService.updateTableStatus(this.table.id, 'pending_payment').subscribe({
      next: () => {
        this.closeModal(true);
      },
      error: () => alert('Error al solicitar la cuenta')
    });
  }
}
