import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { Product, Settings } from '../../models/models';
import { LucideShoppingCart, LucidePlus, LucideX } from '@lucide/angular';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, LucideShoppingCart, LucidePlus, LucideX],
  template: `
    <div class="catalog-container container" [ngStyle]="getBackgroundStyle()">
      <header class="header glass" *ngIf="settings">
        <div class="logo-section">
          <img [src]="settings.logoUrl || 'assets/default-logo.png'" alt="Logo" class="logo" *ngIf="settings.logoUrl">
          <div>
            <h1>{{ settings.businessName }}</h1>
            <p class="store-description" *ngIf="settings.description">{{ settings.description }}</p>
          </div>
        </div>
        <button class="cart-btn" (click)="toggleCart()">
          <svg lucideShoppingCart size="24"></svg>
          <span class="badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
        </button>
      </header>
      
      <div class="categories-bar" *ngIf="categories.length > 1">
        <button 
          *ngFor="let cat of categories" 
          [class.active]="activeCategory === cat"
          (click)="setCategory(cat)"
          class="category-pill">
          {{ cat }}
        </button>
      </div>

      <div class="products-grid grid">
        <div class="product-card glass" *ngFor="let product of filteredProducts">
          <div class="product-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/300x200?text=' + product.name" [alt]="product.name">
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="description">{{ product.description }}</p>
            <div class="price-row">
              <span class="price">$ {{ product.price | number }}</span>
              <button class="add-btn" (click)="onAddClick(product)">
                <svg lucidePlus size="18"></svg>
                {{ product.variants?.length ? 'Ver Opciones' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Variant Selection Modal -->
      <div class="modal-overlay" *ngIf="selectedProduct" (click)="closeModal()">
        <div class="modal-content glass" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h3>Personalizar {{ selectedProduct.name }}</h3>
            <button class="close-btn" (click)="closeModal()"><svg lucideX size="24"></svg></button>
          </header>
          
          <div class="modal-body">
            <div class="modal-preview-image" *ngIf="selectedProduct">
              <img [src]="getDisplayImage()" class="main-preview">
            </div>
            
            <div class="variant-item" *ngFor="let variant of selectedProduct.variants">
              <h4>{{ variant.name }}</h4>
              <div class="options-grid">
                <button 
                  *ngFor="let opt of variant.options" 
                  class="option-pill"
                  [class.selected]="tempOptions[variant.name]?.label === opt.label"
                  [class.sold-out]="opt.isAvailable === false"
                  [disabled]="opt.isAvailable === false"
                  (click)="selectOption(variant.name, opt)"
                >
                  <span class="label">{{ opt.label }}</span>
                  <span class="extra" *ngIf="opt.price > 0 && opt.isAvailable !== false">$ {{ opt.price | number }}</span>
                  <span class="sold-out-badge" *ngIf="opt.isAvailable === false">Agotado</span>
                </button>
              </div>
            </div>
          </div>
          
          <footer class="modal-footer">
            <div class="total-row">
              <span>Total:</span>
              <span class="total-price">$ {{ calculateTotal() | number }}</span>
            </div>
            <button class="confirm-btn" (click)="confirmAdd()" [disabled]="!isAllSelected()">
              {{ isAllSelected() ? 'Agregar al Carrito' : 'Selecciona las opciones' }}
            </button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container { padding-top: 20px; padding-bottom: 100px; min-height: 100vh; background-size: cover; background-position: center; background-attachment: fixed; }
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 15px 20px; margin-bottom: 25px; position: sticky; top: 10px; z-index: 100;
      gap: 10px;
    }
    .logo-section { display: flex; align-items: flex-start; gap: 12px; flex-grow: 1; min-width: 0; }
    .logo-section div { display: flex; flex-direction: column; min-width: 0; padding-top: 5px; }
    .logo { height: 65px; width: 65px; object-fit: cover; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); flex-shrink: 0; }
    h1 { margin: 0; font-size: 1.3rem; line-height: 1.2; word-wrap: break-word; color: #333; }
    .store-description { margin: 0; color: #666; font-size: 0.85rem; line-height: 1.3; margin-top: 6px; }
    .cart-btn {
      background: var(--primary-color); color: white; position: relative;
      border-radius: 50%; width: 48px; height: 48px; padding: 0; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; margin-top: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .badge {
      position: absolute; top: -3px; right: -3px; background: var(--secondary-color);
      color: white; border-radius: 50%; min-width: 20px; height: 20px; 
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px; font-size: 0.7rem; font-weight: 700; border: 2px solid white;
    }
    .product-card {
      overflow: hidden; display: flex; flex-direction: column; height: 100%;
      transition: var(--transition);
    }
    .product-card:hover { transform: translateY(-5px); }
    .product-image img { width: 100%; height: 200px; object-fit: contain; background: white; padding: 10px; box-sizing: border-box; }
    .product-info { padding: 15px; display: flex; flex-direction: column; flex-grow: 1; }
    .description { color: var(--text-light); font-size: 0.85rem; margin-bottom: 12px; flex-grow: 1; line-height: 1.4; }
    .price-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .price { font-size: 1.2rem; font-weight: 700; color: var(--primary-color); white-space: nowrap; }
    .add-btn { background: var(--primary-color); color: white; font-size: 0.85rem; padding: 8px 12px; height: auto; }
    
    .categories-bar { display: flex; gap: 10px; overflow-x: auto; padding: 0 20px 15px; margin-top: -5px; scrollbar-width: none; }
    .categories-bar::-webkit-scrollbar { display: none; }
    .category-pill { background: rgba(255,255,255,0.7); border: 1px solid #eee; padding: 6px 16px; border-radius: 20px; white-space: nowrap; font-weight: 600; color: #555; transition: all 0.2s; font-size: 0.9rem; }
    .category-pill.active { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

    @media (max-width: 600px) {
      .header { padding: 12px 15px; top: 5px; margin-bottom: 20px; }
      .logo { height: 50px; width: 50px; }
      h1 { font-size: 1.1rem; }
      .store-description { font-size: 0.8rem; -webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
      .cart-btn { width: 42px; height: 42px; }
      .cart-btn svg { width: 20px; height: 20px; }
      .products-grid { grid-template-columns: 1fr; gap: 15px; padding: 0 15px; }
      .categories-bar { padding: 0 15px 15px; }
    }

    /* Modal Styling */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px; backdrop-filter: blur(8px);
    }
    .modal-content {
      width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
      background: white; border-radius: 24px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .modal-header h3 { font-size: 1.5rem; font-weight: 800; color: #333; }
    .close-btn { background: #f0f0f0; color: #666; padding: 5px; border-radius: 50%; min-height: auto; }
    
    .variant-item { margin-bottom: 25px; }
    .variant-item h4 { margin-bottom: 12px; color: #666; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    .options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
    
    .option-pill {
      background: #f8f9fa; border: 2px solid #eee; border-radius: 16px;
      padding: 12px 20px; display: flex; flex-direction: column; align-items: center;
      transition: all 0.2s ease; cursor: pointer; flex: 1 1 120px; text-align: center;
    }
    .option-pill.selected { border-color: var(--primary-color); background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: scale(1.05); }
    .option-pill.sold-out { opacity: 0.5; background: #eee; cursor: not-allowed; border-style: dashed; }
    .option-pill .label { font-weight: 700; color: #333; }
    .option-pill.sold-out .label { text-decoration: line-through; }
    .sold-out-badge { font-size: 0.7rem; color: #ff5252; font-weight: 700; margin-top: 4px; }
    .option-pill .extra { font-size: 0.85rem; color: var(--primary-color); font-weight: 600; margin-top: 4px; }
    
    .modal-footer { border-top: 1px solid #eee; padding-top: 25px; margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .total-price { font-size: 2rem; font-weight: 900; color: var(--primary-color); }

    .modal-preview-image { width: 100%; height: 250px; border-radius: 16px; overflow: hidden; margin-bottom: 20px; background: #f8f9fa; }
    .main-preview { width: 100%; height: 100%; object-fit: contain; background: white; }
    
    .confirm-btn { width: 100%; background: var(--primary-color); color: white; padding: 18px; border-radius: 16px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .confirm-btn:disabled { background: #e0e0e0; color: #999; cursor: not-allowed; box-shadow: none; }
  `]
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Todos'];
  activeCategory: string = 'Todos';
  settings: Settings | null = null;
  cartCount = 0;

  storeSlug: string = '';

  constructor(
    private dataService: DataService,
    private cartService: CartService,
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
      this.loadStoreData();
    });

    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });
  }

  loadStoreData() {
    this.dataService.getProductsBySlug(this.storeSlug).pipe(
      catchError(err => {
        console.error('Error al cargar productos de esta tienda', err);
        return of([]);
      })
    ).subscribe(products => {
      this.products = products;
      
      const cats = products.map(p => p.category).filter(c => c && c.trim() !== '') as string[];
      const uniqueCats = [...new Set(cats)];
      this.categories = ['Todos', ...uniqueCats];
      
      this.applyFilters();
    });

    this.dataService.getSettingsBySlug(this.storeSlug).pipe(
      catchError(err => {
        console.error('Error cargando configuración de la tienda', err);
        return of({
          businessName: 'Mi Negocio',
          primaryColor: '#ff4081',
          secondaryColor: '#3f51b5',
          whatsappNumber: '573000000000',
          welcomeMessage: 'Hola'
        } as Settings);
      })
    ).subscribe(settings => {
      this.settings = settings;
      if (settings) {
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
        
        // Aplicar color de fondo al body para que no queden huecos blancos
        if (settings.backgroundColor) {
          document.body.style.backgroundColor = settings.backgroundColor;
        }
      }
    });
    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });
  }

  selectedProduct: Product | null = null;
  tempOptions: { [key: string]: any } = {};

  getBackgroundStyle() {
    if (!this.settings) return {};
    const styles: any = {};
    if (this.settings.backgroundColor) {
      styles['background-color'] = this.settings.backgroundColor;
    }
    if (this.settings.backgroundImageUrl) {
      styles['background-image'] = `url(${this.settings.backgroundImageUrl})`;
    }
    return styles;
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      if (p.isActive === false) return false;
      if (this.activeCategory !== 'Todos') {
        return p.category === this.activeCategory;
      }
      return true;
    });
  }

  onAddClick(product: Product) {
    if (product.variants && product.variants.length > 0) {
      this.selectedProduct = product;
      this.tempOptions = {};
    } else {
      this.addToCart(product);
    }
  }

  selectOption(variantName: string, option: any) {
    if (this.tempOptions[variantName]?.label === option.label) {
      // Deseleccionar
      const newOptions = { ...this.tempOptions };
      delete newOptions[variantName];
      this.tempOptions = newOptions;
    } else {
      // Seleccionar nueva opción (asegurar nueva referencia)
      this.tempOptions = { ...this.tempOptions, [variantName]: option };
    }
  }

  getDisplayImage(): string {
    if (!this.selectedProduct) return '';
    
    // Buscar si alguna opción seleccionada tiene imagen (prioridad a la última seleccionada)
    const optionsWithImage = Object.values(this.tempOptions).filter(opt => opt.imageUrl);
    if (optionsWithImage.length > 0) {
      return optionsWithImage[optionsWithImage.length - 1].imageUrl;
    }
    
    return this.selectedProduct.imageUrl || 'https://via.placeholder.com/300';
  }

  isAllSelected(): boolean {
    return true; // Ahora las variantes son opcionales
  }

  calculateTotal(): number {
    if (!this.selectedProduct) return 0;
    
    const options = Object.values(this.tempOptions);
    // Buscamos si alguna variante tiene un precio definido (> 0)
    const variantWithPrice = options.find(opt => opt.price > 0);
    
    if (variantWithPrice) {
      // Si hay una variante con precio, ese es nuestro nuevo base
      // Sumamos el resto de variantes que tengan precio (por si hay múltiples grupos)
      return options.reduce((acc, opt) => acc + (opt.price || 0), 0);
    }
    
    // Si ninguna variante tiene precio, usamos el base del producto
    return this.selectedProduct.price;
  }

  confirmAdd() {
    if (this.selectedProduct && this.isAllSelected()) {
      this.cartService.addToCart(this.selectedProduct, this.tempOptions);
      this.closeModal();
    }
  }

  closeModal() {
    this.selectedProduct = null;
    this.tempOptions = {};
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  toggleCart() {
    this.router.navigate([`/${this.storeSlug}/cart`]);
  }
}
