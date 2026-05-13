import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '@shared/models/models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <div class="products-header">
        <div class="search-box">
          <i class="fas fa-search" style="color: #64748b; margin-right: 10px;"></i>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Buscar productos por nombre o categoría...">
        </div>
        
        <div class="category-tabs">
          <button 
            *ngFor="let cat of categories" 
            class="cat-tab"
            [class.active]="activeCategory === cat"
            (click)="selectCategory(cat)">
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="product-grid-admin">
        <div class="admin-card" *ngFor="let product of filteredProducts">
          <div class="admin-card-img">
            <img [src]="product.imageUrl || '/assets/logo-uparmall.png'" 
                 (error)="handleImageError($event)"
                 [alt]="product.name">
            <div class="card-badges">
              <span class="badge" [class.badge-active]="product.isActive" [class.badge-inactive]="!product.isActive">
                {{ product.isActive ? 'Activo' : 'Inactivo' }}
              </span>
              <span *ngIf="product.manageStock" class="badge" 
                    [class.badge-stock-ok]="product.stock! > (product.lowStockThreshold || 5)" 
                    [class.badge-stock-low]="product.stock! <= (product.lowStockThreshold || 5)">
                <i class="fas fa-cubes"></i> {{ product.stock! <= (product.lowStockThreshold || 5) ? 'Bajo Stock: ' : 'Stock: ' }} {{ product.stock }}
              </span>
            </div>
          </div>
          <div class="card-details">
            <h4>{{ product.name }}</h4>
            <p>{{ product.description || 'Sin descripción' }}</p>
            <div class="card-bottom">
              <span class="price-text">$ {{ product.price | number }}</span>
              <div class="card-actions">
                <button class="btn-circle" (click)="edit.emit(product)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-circle btn-delete" (click)="delete.emit(product.id)" title="Eliminar">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="filteredProducts.length === 0" style="grid-column: 1 / -1; text-align: center; padding: 100px;">
          <p style="font-size: 1.2rem; font-weight: 800; color: #888;">No se encontraron productos.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-header { display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px; }
    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 16px 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .search-box input { border: none; outline: none; font-size: 1rem; font-weight: 600; width: 100%; color: #0f172a; }

    .category-tabs { 
      display: flex; 
      gap: 10px; 
      overflow-x: auto; 
      padding: 4px 0 15px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .category-tabs::-webkit-scrollbar { display: none; }

    .cat-tab {
      padding: 10px 20px;
      border-radius: 100px;
      background: white;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    .cat-tab:hover {
      background: #f1f5f9;
      color: #0f172a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .cat-tab.active { background: #0f172a; color: white; border-color: #0f172a; }
    .cat-tab.active:hover { transform: none; background: #0f172a; box-shadow: none; }
    .cat-tab:active { transform: scale(0.96); }

    .product-grid-admin { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 20px; 
      width: 100%;
      overflow-x: hidden;
    }
    .admin-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; transition: 0.2s; display: flex; flex-direction: column; }
    .admin-card:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0,0,0,0.08); }
    .admin-card-img { height: 160px; position: relative; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 15px; flex-shrink: 0; }
    .admin-card-img img { width: 100%; height: 100%; object-fit: contain; }
    .card-badges { position: absolute; top: 10px; left: 10px; z-index: 10; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.6rem; font-weight: 900; text-transform: uppercase; }
    .badge-active { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .badge-inactive { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .badge-stock-ok { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; margin-left: 5px; }
    .badge-stock-low { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; margin-left: 5px; animation: pulse-warn 2s infinite; }
    
    @keyframes pulse-warn {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .card-details { padding: 15px; flex: 1; display: flex; flex-direction: column; }
    .card-details h4 { margin: 0 0 6px; font-size: 1rem; font-weight: 900; color: #0f172a; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-details p { margin: 0 0 12px; font-size: 0.8rem; color: #64748b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; flex: 1; }
    .card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .price-text { font-size: 1.1rem; font-weight: 950; color: #0f172a; }

    .card-actions { display: flex; gap: 6px; }
    .btn-circle {
      width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0;
      background: white; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: 0.2s;
    }
    .btn-circle:hover { background: #0f172a; color: white; transform: scale(1.1); }
    .btn-delete:hover { background: #ef4444 !important; border-color: #ef4444 !important; }

    @media (max-width: 600px) {
      .products-header { gap: 12px; margin-bottom: 20px; }
      .search-box { padding: 12px 15px; border-radius: 12px; }
      .search-box input { font-size: 0.9rem; }
      .product-grid-admin { grid-template-columns: 1fr; gap: 12px; }
      .admin-card-img { height: 140px; }
      .card-details { padding: 12px; }
      .price-text { font-size: 1rem; }
    }
  `]
})
export class InventoryComponent {
  @Input() products: Product[] = [];
  @Input() categories: string[] = ['Todos'];
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<number>();
  @Output() add = new EventEmitter<void>();

  searchTerm = '';
  activeCategory = 'Todos';

  get filteredProducts() {
    let f = this.products || [];
    if (this.activeCategory !== 'Todos') f = f.filter(p => p.category === this.activeCategory);
    if (this.searchTerm) f = f.filter(p => p.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    return f;
  }

  handleImageError(event: any) {
    event.target.src = '/assets/logo-uparmall.png';
  }

  selectCategory(cat: string) {
    this.activeCategory = cat;
  }

  onSearchChange() {
    // Search is handled by the getter
  }
}
