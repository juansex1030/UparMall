import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { Product, Settings, HeroSlide } from '../../models/models';
import {
  LucideChevronDown
} from '@lucide/angular';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideChevronDown,
    DecimalPipe
  ],
  template: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Outfit:wght@400;700;900&family=Poppins:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Dancing+Script:wght@700&family=Satisfy&display=swap');
    </style>
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loader"></div>
    </div>

    <div class="store-layout" *ngIf="settings" [ngStyle]="getCombinedStyles()" 
         [style.--primary-color]="settings.primaryColor"
         [style.--secondary-color]="settings.secondaryColor || ''"
         [style.--accent-color]="settings.accentColor || ''"
         [style.--bg-color]="settings.backgroundColor || ''">

      <!-- NAVBAR -->
      <nav class="main-nav" [class]="settings.navbarStyle || 'minimal'" [class.scrolled]="isScrolled">
        <div class="nav-container container">
          <div class="nav-left">
            <button class="menu-trigger" (click)="isMobileMenuOpen = !isMobileMenuOpen">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="nav-logo" (click)="scrollToTop()">
              <img [src]="settings.logoUrl || 'assets/default-logo.png'" alt="Logo" class="mini-logo" *ngIf="settings.logoUrl">
              <span class="business-name">{{ settings.businessName }}</span>
            </div>
          </div>

          <div class="nav-center desktop-only">
            <div class="nav-categories">
              <button class="nav-cat-btn" (click)="isNavCatOpen = !isNavCatOpen">
                Categorías
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="isNavCatOpen"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="nav-cat-dropdown" *ngIf="isNavCatOpen">
                <a *ngFor="let cat of categories.slice(0, 6)" (click)="setCategory(cat); isNavCatOpen = false">
                  {{ cat }}
                </a>
                <a (click)="scrollToProducts(); isNavCatOpen = false" class="see-all">Ver todas →</a>
              </div>
            </div>
            <a (click)="scrollToProducts()">Productos</a>
          </div>

          <div class="nav-actions">
            <button class="search-btn desktop-only" (click)="scrollToProducts()">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <button class="nav-cart-btn" (click)="toggleCart()" [class.cart-pulse]="isCartAnimating">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span class="nav-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </button>
          </div>
        </div>

        <!-- MOBILE MENU OVERLAY -->
        <div class="mobile-menu-overlay" *ngIf="isMobileMenuOpen" (click)="isMobileMenuOpen = false">
          <div class="mobile-menu" (click)="$event.stopPropagation()">
            <div class="mobile-menu-header">
              <span class="business-name">{{ settings.businessName }}</span>
              <button (click)="isMobileMenuOpen = false"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div class="mobile-menu-body">
              <div class="mobile-section">
                <h6>Categorías</h6>
                <div class="mobile-cat-list">
                  <button *ngFor="let cat of categories" 
                          (click)="setCategory(cat); isMobileMenuOpen = false"
                          [class.active]="activeCategory === cat">
                    {{ cat }}
                  </button>
                </div>
              </div>
              <div class="mobile-section">
                <h6>Enlaces</h6>
                <a (click)="scrollToTop(); isMobileMenuOpen = false">Inicio</a>
                <a (click)="scrollToProducts(); isMobileMenuOpen = false">Catálogo</a>
                <a (click)="toggleCart(); isMobileMenuOpen = false">Mi Carrito</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- HERO SLIDER -->
      <section class="hero-slider" *ngIf="settings">
        <div class="slides-container" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
          <div class="slide" *ngFor="let slide of heroSlides">
            <img [src]="slide.url" [alt]="slide.title" class="slide-img">
            <div class="slide-overlay">
            <div class="slide-overlay">
              <div class="slide-content container">
                <h2 class="hero-title animate-in">{{ settings.businessName }}</h2>
                <p class="hero-subtitle animate-in delay-1">{{ settings.welcomeMessage || '¡Bienvenidos a nuestra tienda!' }}</p>
                <button class="shop-now-btn animate-in delay-2" (click)="scrollToProducts()">
                  Explorar Catálogo
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
        <div class="slider-controls" *ngIf="heroSlides.length > 1">
          <div class="slider-dots">
            <span *ngFor="let slide of heroSlides; let i = index" 
                  [class.active]="currentSlide === i" 
                  (click)="setSlide(i)"></span>
          </div>
        </div>
      </section>

      <!-- MAIN SECTION -->
      <main class="main-content container" id="products-section">
        <div class="section-header">
          <div class="header-info">
            <h3 class="section-title">Lo más destacado</h3>
            <p class="section-subtitle">Explora nuestra colección curada</p>
          </div>
          
          <div class="categories-dropdown">
            <button class="cat-toggle" (click)="isCategoryMenuOpen = !isCategoryMenuOpen">
              <div class="cat-current">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>{{ activeCategory === 'Todos' ? 'Categorías' : activeCategory }}</span>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="isCategoryMenuOpen"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            <div class="cat-menu" *ngIf="isCategoryMenuOpen">
              <div class="cat-search">
                <input type="text" [(ngModel)]="categorySearchTerm" placeholder="Filtrar categorías.." (click)="$event.stopPropagation()">
              </div>
              <div class="cat-list">
                <button 
                  *ngFor="let cat of filteredCategories" 
                  [class.active]="activeCategory === cat"
                  (click)="setCategory(cat); isCategoryMenuOpen = false"
                  class="cat-item">
                  {{ cat }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="products-grid">
          <div class="product-card glass-card" *ngFor="let product of filteredProducts">
            <div class="card-image-wrapper">
              <img [src]="product?.imageUrl || 'https://via.placeholder.com/400x400?text=' + product.name" [alt]="product.name">
              <div class="card-badge" *ngIf="product.price < 50000">Oferta</div>
            </div>
            <div class="card-body">
              <div class="card-meta">
                <span class="card-category">{{ product?.category }}</span>
                <h3 class="card-title">{{ product.name }}</h3>
              </div>
              <p class="card-desc">{{ product?.description }}</p>
              <div class="card-footer">
                <span class="card-price">$ {{ product.price | number }}</span>
                <div class="card-actions">
                  <button class="btn-icon" title="Ver detalles" (click)="onAddClick(product)">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-90deg)"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                  <button class="btn-primary" (click)="onAddClick(product, $event)" [class.btn-success]="justAddedId === product.id">
                    <svg *ngIf="justAddedId !== product.id" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <svg *ngIf="justAddedId === product.id" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{{ justAddedId === product.id ? 'Añadido' : 'Agregar' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- FOOTER -->
      <footer class="footer" *ngIf="settings">
        <div class="footer-container container">
          <div class="footer-main">
            <div class="footer-brand">
              <div class="footer-logo-wrap">
                <img [src]="settings.logoUrl" alt="Logo" class="footer-logo" *ngIf="settings.logoUrl">
                <span class="footer-business-name">{{ settings.businessName }}</span>
              </div>
              <p class="footer-tagline">{{ settings.welcomeMessage }}</p>
              <div class="footer-socials">
                <a href="#" class="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a href="#" class="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" class="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.2-17.4 12.8 0 0 3 0 4.5-1.5-1.5 0-2.7-1-3.2-2.3.2 0 .4 0 .6.1 1.5-.1 2.6-1.1 3-2.3-1.5-.3-2.5-1.2-3-2.7.2.1.4.1.6.1 1.6-.1 3-1.1 3.4-2.5-1.4-.9-1.9-2.1-2.1-3.3.6.3 1.3.5 2 .5C5.4 6.5 4 4.5 4.5 3c2.4 3 5.4 5 9 5.5-.1-.4-.1-.8-.1-1.2 0-2.6 2.1-4.6 4.7-4.6 1.4 0 2.6.6 3.4 1.5.8-.2 1.6-.5 2.4-1-.3.8-.9 1.4-1.7 1.9.7-.1 1.4-.3 2.1-.6-.5.7-1.1 1.3-1.8 1.8z"></path></svg>
                </a>
              </div>
            </div>

            <div class="footer-group">
              <h5>Explorar</h5>
              <ul class="footer-links">
                <li><a (click)="scrollToTop()">Inicio</a></li>
                <li><a (click)="scrollToProducts()">Colección</a></li>
                <li><a (click)="toggleCart()">Carrito</a></li>
              </ul>
            </div>

            <div class="footer-group">
              <h5>Ayuda</h5>
              <div class="social-links" *ngIf="settings.socialLinks">
                <a [href]="settings.socialLinks.instagram" target="_blank" *ngIf="settings.socialLinks.instagram" class="social-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a [href]="settings.socialLinks.facebook" target="_blank" *ngIf="settings.socialLinks.facebook" class="social-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
              <ul class="footer-links">
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Envíos</a></li>
                <li><a href="#">Términos</a></li>
              </ul>
            </div>

            <div class="footer-newsletter">
              <h5>Newsletter</h5>
              <p>Suscríbete para recibir ofertas exclusivas.</p>
              <div class="newsletter-form">
                <input type="email" placeholder="Tu email">
                <button class="newsletter-btn"><svg lucideChevronDown size="18" style="transform: rotate(-90deg)"></svg></button>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; 2026 {{ settings.businessName }}?. Creado con elegancia.</p>
            <div class="footer-legal">
              <a href="#">Privacidad</a>
              <span class="sep"></span>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <!-- Variant Selection Modal -->
      <div class="modal-overlay" *ngIf="selectedProduct" (click)="closeModal()">
        <div class="modal-content glass" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h3>Personalizar {{ selectedProduct.name }}</h3>
            <button class="close-btn" (click)="closeModal()"><svg lucideX size="24"></svg></button>
          </header>

          <div class="modal-body">
            <div class="modal-preview-image" *ngIf="selectedProduct">
              <img [src]="getDisplayImage()" class="main-preview" />
            </div>

            <div class="specs-section" *ngIf="selectedProduct.specifications?.length">
              <h4>Especificaciones Técnicas</h4>
              <div class="specs-table glass">
                <div class="spec-item" *ngFor="let spec of selectedProduct.specifications">
                  <span class="spec-key">{{ spec.key }}</span>
                  <span class="spec-value">{{ spec.value }}</span>
                </div>
              </div>
            </div>

            <div class="variant-item" *ngFor="let variant of selectedProduct.variants">
              <h4>{{ variant.name }}</h4>
              <div class="options-grid">
                <button
                  *ngFor="let opt of variant.options"
                  class="option-pill"
                  [class.selected]="tempOptions[variant.name || '']?.label === opt.label"
                  [class.sold-out]="opt.isAvailable === false"
                  [disabled]="opt.isAvailable === false"
                  (click)="selectOption(variant.name, opt)"
                >
                  <span class="label">{{ opt.label }}</span>
                  <span class="extra" *ngIf="opt.price > 0 && opt.isAvailable !== false"
                    >$ {{ opt.price | number }}</span
                  >
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
      <!-- SIDE CART DRAWER -->
      <div class="cart-drawer-overlay" *ngIf="isCartOpen" (click)="isCartOpen = false">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <header class="cart-drawer-header">
            <h3>Tu Carrito ({{ cartCount }})</h3>
            <button class="close-btn" (click)="isCartOpen = false"><svg lucideX size="24"></svg></button>
          </header>

          <div class="cart-drawer-body">
            <div class="empty-cart-msg" *ngIf="cartItems.length === 0">
              <p>Tu carrito está vacío</p>
              <button class="shop-btn" (click)="isCartOpen = false">Seguir Comprando</button>
            </div>

            <div class="cart-drawer-items" *ngIf="cartItems.length > 0">
              <div class="cart-drawer-item" *ngFor="let item of cartItems">
                <div class="item-img-box">
                  <img [src]="item.product.imageUrl || 'https://via.placeholder.com/100'" [alt]="item.product.name">
                </div>
                <div class="item-info">
                  <h4>{{ item.product.name }}</h4>
                  <p class="item-variants" *ngIf="item.selectedOptions && getOptionsKeys(item.selectedOptions).length">
                    <span *ngFor="let key of getOptionsKeys(item.selectedOptions)">{{ key }}: {{ item.selectedOptions[key]?.label }} </span>
                  </p>
                  <p class="item-price">$ {{ item.product.price | number }}</p>
                  <div class="item-qty-row">
                    <div class="qty-controls">
                      <button (click)="updateCartQty(item.product.id, item.quantity - 1, item.selectedOptions)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                      <span>{{ item.quantity }}</span>
                      <button (click)="updateCartQty(item.product.id, item.quantity + 1, item.selectedOptions)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                    <button class="item-remove" (click)="removeCartItem(item.product.id, item.selectedOptions)">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="cart-drawer-footer" *ngIf="cartItems.length > 0">
            <div class="cart-total-row">
              <span>Subtotal:</span>
              <span class="total-val">$ {{ getCartTotal() | number }}</span>
            </div>
            <button class="checkout-btn" (click)="goToCheckout()">
              Finalizar Pedido
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
      font-family: var(--font-family, var(--font-primary));
      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --shadow-soft: 0 10px 30px rgba(0,0,0,0.05);
      --shadow-heavy: 0 20px 40px rgba(0,0,0,0.1);
      --glass: rgba(255, 255, 255, 0.8);
      --primary-color-alt: #1a1a1a;
    }

    /* Base Layout */
    .container {
      max-width: 1400px; margin: 0 auto;
      padding: 0 clamp(1rem, 5vw, 4rem);
      width: 100%; box-sizing: border-box;
    }

    .store-layout {
      min-height: 100vh; display: flex; flex-direction: column;
      background: var(--bg-color, #f0f2f5);
      font-family: var(--font-family, var(--font-primary));
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed; inset: 0; z-index: 2000;
      background: white; display: flex; align-items: center; justify-content: center;
    }
    .loader {
      width: 40px; height: 40px; border: 4px solid #f3f3f3;
      border-top: 4px solid var(--primary-color, #1a1a1a);
      border-radius: 50%; animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Navbar */
    .main-nav {
      position: sticky; top: 0; left: 0; width: 100%; z-index: 1000;
      transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); padding: 15px 0;
    }
    .main-nav.glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(15px); }
    .main-nav.solid { background: var(--primary-color); color: white; }
    .main-nav.minimal { background: transparent; }
    .main-nav.scrolled { padding: 10px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .main-nav.scrolled.glass { background: rgba(255,255,255,0.9); }
    .main-nav.scrolled.solid { background: var(--primary-color); }
    .main-nav.scrolled.minimal { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); }
    
    .main-nav.solid .business-name, 
    .main-nav.solid .nav-link, 
    .main-nav.solid .menu-trigger,
    .main-nav.solid .nav-cat-btn { color: white; }
    .main-nav.solid .nav-badge { background: white; color: var(--primary-color); }
    
    .nav-container { display: flex; justify-content: space-between; align-items: center; }
    .nav-left { display: flex; align-items: center; gap: 15px; }
    
    .nav-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .mini-logo { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .business-name { font-weight: 950; font-size: 1.3rem; color: #1a1a1a; letter-spacing: -1px; }

    .nav-center { display: flex; align-items: center; gap: 35px; }
    .nav-link { 
      font-weight: 800; color: #444; text-decoration: none; cursor: pointer; 
      transition: 0.3s; font-size: 0.95rem; position: relative;
    }
    .nav-link:hover { color: var(--primary-color); }

    .nav-categories { position: relative; }
    .nav-cat-btn {
      background: white; border: 1px solid rgba(0,0,0,0.05); font-weight: 800; color: #1a1a1a;
      display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem;
      padding: 10px 18px; border-radius: 100px; transition: 0.3s;
      box-shadow: var(--shadow-soft);
    }
    .nav-cat-btn:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    
    .nav-cat-dropdown {
      position: absolute; top: calc(100% + 15px); left: 0; background: white;
      min-width: 240px; border-radius: 20px; box-shadow: var(--shadow-heavy);
      padding: 15px; border: 1px solid rgba(0,0,0,0.05); animation: slideUp 0.3s ease;
      z-index: 3100;
    }
    .nav-cat-dropdown a {
      display: block; padding: 12px 18px; border-radius: 12px; color: #1a1a1a;
      font-weight: 700; text-decoration: none; transition: 0.2s;
    }
    .nav-cat-dropdown a:hover { background: #f4f4f4; color: var(--primary-color); }
    .nav-cat-dropdown .see-all { border-top: 1px solid #f0f0f0; margin-top: 10px; color: var(--primary-color); font-weight: 900; }

    .nav-actions { display: flex; align-items: center; gap: 10px; }
    .menu-trigger, .search-btn, .nav-cart-btn {
      display: flex;
      width: 44px; height: 44px; border-radius: 12px; border: 2px solid var(--primary-color);
      background: white; color: var(--primary-color);
      align-items: center; justify-content: center;
      cursor: pointer; transition: 0.3s; position: relative;
      box-shadow: var(--shadow-soft);
    }
    .main-nav button svg {
      stroke: var(--primary-color);
      display: block;
      transition: 0.3s;
    }
    @media (min-width: 992px) {
      .menu-trigger { display: none !important; }
    }
    .menu-trigger:hover, .search-btn:hover, .nav-cart-btn:hover { background: var(--primary-color); color: white; transform: scale(1.05); }
    .main-nav button:hover svg { stroke: white; }
    .nav-badge {
      position: absolute; top: -5px; right: -5px; background: var(--primary-color, #ef4444);
      color: white; font-size: 0.65rem; min-width: 18px; height: 18px; padding: 0 4px;
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-weight: 900; border: 2px solid white;
    }

    /* Mobile Menu */
    .mobile-menu-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
      z-index: 5000; display: flex;
    }
    .mobile-menu {
      width: 80%; max-width: 320px; height: 100%; background: white;
      display: flex; flex-direction: column; animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    .mobile-menu-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
    .mobile-menu-body { padding: 30px; overflow-y: auto; flex: 1; }
    .mobile-section { margin-bottom: 40px; }
    .mobile-section h6 { font-size: 0.7rem; text-transform: uppercase; color: #bbb; letter-spacing: 3px; margin-bottom: 20px; }
    .mobile-cat-list { display: flex; flex-direction: column; gap: 8px; }
    .mobile-cat-list button { text-align: left; background: #f9f9f9; border: none; padding: 12px 15px; border-radius: 12px; font-weight: 700; }
    .mobile-cat-list button.active { background: var(--primary-color); color: white; }

    /* Hero Slider Compact Redesign */
    .hero-slider { 
      width: 100%; 
      height: clamp(350px, 50vh, 500px); 
      position: relative; 
      overflow: hidden; 
      background: #000;
    }
    .slides-container { display: flex; height: 100%; transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1); }
    .slide { min-width: 100%; height: 100%; position: relative; }
    .slide-img { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
      object-position: center;
    }
    .slide-overlay {
      position: absolute; 
      inset: 0;
      background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
      display: flex; 
      align-items: center;
    }
    .slide-content {
      padding: 0 5%;
      max-width: 800px;
    }
    .hero-title { 
      font-size: clamp(2.8rem, 6vw, 4.5rem); 
      font-weight: 900; 
      color: white; 
      margin-bottom: 1.2rem; 
      line-height: 1;
      letter-spacing: -2px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .hero-subtitle { 
      font-size: clamp(1.1rem, 2vw, 1.4rem); 
      color: rgba(255,255,255,0.85); 
      margin-bottom: 3rem; 
      line-height: 1.5;
      max-width: 600px;
    }
    .shop-now-btn {
      background: var(--primary-color, #1a1a1a); 
      color: #fff; 
      padding: 1.3rem 3rem; 
      border-radius: 100px;
      font-weight: 900; 
      cursor: pointer; 
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
      border: none;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .shop-now-btn:hover { 
      filter: brightness(0.9);
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }

    .slider-dots { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 10; }
    .slider-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: 0.4s; }
    .slider-dots span.active { width: 40px; border-radius: 10px; background: white; }

    /* Main Content */
    .main-content { padding-top: 4rem; padding-bottom: 8rem; }
    .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; gap: 2rem; flex-wrap: wrap; }
    .section-title { font-size: 3rem; font-weight: 950; letter-spacing: -1.5px; margin-bottom: 0.5rem; }
    .section-subtitle { color: #888; font-size: 1.1rem; }

    /* Categories Dropdown */
    .categories-dropdown { position: relative; min-width: 260px; }
    .cat-toggle {
      width: 100%; padding: 1.2rem 1.8rem; background: white; border-radius: 18px;
      border: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; box-shadow: var(--shadow-soft);
    }
    .cat-menu {
      position: absolute; top: calc(100% + 12px); right: 0; width: 100%; min-width: 320px;
      background: white; border-radius: 20px; box-shadow: var(--shadow-heavy);
      z-index: 100; overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .cat-search { padding: 1.2rem; background: #fafafa; }
    .cat-search input { width: 100%; padding: 0.9rem 1.2rem; border-radius: 12px; border: 1px solid #eee; }
    .cat-list { max-height: 350px; overflow-y: auto; padding: 0.8rem; }
    .cat-item { width: 100%; padding: 1rem 1.4rem; text-align: left; border-radius: 12px; font-weight: 700; color: #444; }
    .cat-item:hover { background: #f4f4f4; color: var(--primary-color); }
    .cat-item.active { background: #1a1a1a; color: white; }

    /* Product Grid & Cards */
    .products-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 2.5rem; 
    }
    .glass-card {
      background: white; border-radius: 28px; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.03); transition: 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67); 
      display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }
    .glass-card:hover { transform: translateY(-15px); box-shadow: 0 30px 60px rgba(0,0,0,0.08); }
    
    .card-image-wrapper { 
      position: relative; aspect-ratio: 1/1; background: #fff; 
      display: flex; align-items: center; justify-content: center; padding: 2rem;
    }
    .card-image-wrapper img { width: 100%; height: 100%; object-fit: contain; transition: 0.5s; }
    .glass-card:hover .card-image-wrapper img { transform: scale(1.08); }
    
    .card-badge { 
      position: absolute; top: 1.5rem; left: 1.5rem; background: #1a1a1a; color: white; 
      padding: 0.5rem 1.2rem; border-radius: 12px; font-weight: 900; font-size: 0.7rem;
    }

    .card-body { padding: 2rem; flex-grow: 1; display: flex; flex-direction: column; }
    .card-category { font-size: 0.75rem; color: var(--primary-color); font-weight: 900; text-transform: uppercase; margin-bottom: 0.8rem; }
    .card-title { font-size: 1.4rem; font-weight: 900; margin-bottom: 1rem; color: #1a1a1a; line-height: 1.2; }
    .card-desc { color: #777; font-size: 1rem; margin-bottom: 2rem; flex-grow: 1; line-height: 1.5; }
    
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #f8f8f8; }
    .card-price { font-size: 1.8rem; font-weight: 950; color: #1a1a1a; }
    .card-actions { display: flex; gap: 10px; }
    
    .btn-icon { 
      width: 48px; height: 48px; border-radius: 14px; background: #f4f4f4; 
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
    }
    .btn-icon:hover { background: #eee; }
    
    .btn-primary { 
      background: var(--primary-color, #1a1a1a); color: white; padding: 0 1.8rem; height: 48px; 
      border-radius: 14px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer;
      border: none;
    }
    .btn-primary:hover { filter: brightness(1.2); transform: translateY(-2px); }
    .btn-success { background: #22c55e !important; }

    /* Footer */
    .footer { background: #0f1115; color: white; padding: 100px 0 40px; margin-top: 80px; }
    .footer-main { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; }
    .footer-logo-wrap { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
    .footer-logo { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; }
    .footer-business-name { font-size: 1.5rem; font-weight: 900; }
    .footer-socials { display: flex; gap: 15px; margin-top: 25px; }
    .social-btn { color: white; opacity: 0.6; transition: 0.3s; }
    .social-btn:hover { opacity: 1; color: var(--primary-color); }
    .footer-links { list-style: none; padding: 0; }
    .footer-links li { margin-bottom: 12px; }
    .footer-links a { color: #888; text-decoration: none; cursor: pointer; transition: 0.2s; }
    .footer-links a:hover { color: white; padding-left: 5px; }
    .footer-newsletter input { width: 100%; padding: 15px; border-radius: 12px; border: none; background: #1a1c22; color: white; margin-bottom: 15px; }

    /* Responsive Queries */
    @media (max-width: 1024px) {
      .desktop-only { display: none !important; }
      .menu-trigger { display: flex; }
      .nav-center { display: none; }
      .products-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    }
    @media (max-width: 768px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .card-image-wrapper { height: 180px; padding: 15px; }
      .card-body { padding: 15px; }
      .card-title { font-size: 1rem; height: 2.2rem; }
      .card-desc { display: none; }
      .card-price { font-size: 1.1rem; }
      .btn-primary { padding: 0 1rem; font-size: 0.8rem; height: 40px; }
    }
    @media (max-width: 640px) {
      .section-title { font-size: 2.2rem; }
      .footer-main { grid-template-columns: 1fr; gap: 30px; text-align: center; }
      .footer-brand, .footer-newsletter { display: flex; flex-direction: column; align-items: center; }
    }

    /* Modal & Specs */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
    .modal-content { width: 95%; max-width: 600px; max-height: 90vh; background: white; border-radius: 30px; display: flex; flex-direction: column; overflow: hidden; }
    .modal-header { padding: 25px 30px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 30px; overflow-y: auto; flex: 1; }
    .modal-preview-image { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; }
    .modal-preview-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .specs-table { background: #f9f9f9; padding: 15px; border-radius: 15px; margin-bottom: 25px; }
    .spec-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .spec-key { font-weight: 700; color: #666; }
    .spec-value { font-weight: 900; }
    .option-pill { padding: 12px 20px; border-radius: 12px; border: 2px solid #eee; background: white; font-weight: 700; cursor: pointer; }
    .option-pill.selected { border-color: var(--primary-color); background: rgba(var(--primary-color-rgb), 0.05); }
    .option-pill.sold-out { opacity: 0.5; cursor: not-allowed; }
    .options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
    
    .modal-footer { padding: 25px 30px; background: #fafafa; border-top: 1px solid #f0f0f0; }
    .confirm-btn { width: 100%; height: 54px; background: #1a1a1a; color: white; border-radius: 15px; font-weight: 900; cursor: pointer; }
    .confirm-btn:disabled { background: #ccc; cursor: not-allowed; }
    .footer-business-name {
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .footer-tagline {
      color: rgba(255,255,255,0.5);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 30px;
      max-width: 320px;
    }
    .footer-socials {
      display: flex;
      gap: 12px;
    }
    .social-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: 0.3s;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .social-btn:hover {
      background: var(--primary-color);
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .social-btn svg { width: 20px; height: 20px; }

    .footer-group h5 {
      color: white;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 30px;
      font-weight: 700;
    }
    .footer-links {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .footer-links a {
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 1rem;
      transition: 0.2s;
      cursor: pointer;
    }
    .footer-links a:hover {
      color: var(--primary-color);
      padding-left: 5px;
    }

    .footer-newsletter h5 {
      color: white;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 30px;
      font-weight: 700;
    }
    .footer-newsletter p {
      color: rgba(255,255,255,0.5);
      font-size: 0.95rem;
      margin-bottom: 25px;
    }
    .newsletter-form {
      display: flex;
      gap: 10px;
    }
    .newsletter-form input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 12px 20px;
      border-radius: 12px;
      color: white;
      outline: none;
    }
    .newsletter-btn {
      width: 48px;
      height: 48px;
      background: var(--primary-color);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.3s;
    }
    .newsletter-btn:hover {
      transform: scale(1.05);
      filter: brightness(1.2);
    }

    .footer-bottom {
      padding-top: 40px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: rgba(255,255,255,0.3);
      font-size: 0.9rem;
    }
    .footer-legal {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .footer-legal a {
      color: rgba(255,255,255,0.3);
      text-decoration: none;
      transition: 0.2s;
    }
    .footer-legal a:hover { color: white; }
    .sep { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.1); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-content { background: white; width: 100%; max-width: 500px; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-heavy); }
    .modal-header { padding: 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
    .modal-body { padding: 2rem; max-height: 60vh; overflow-y: auto; }
    .modal-footer { padding: 2rem; border-top: 1px solid #f0f0f0; }
    .option-pill { background: #f9f9f9; border: 2px solid #eee; padding: 1rem; border-radius: var(--radius-md); flex: 1 1 120px; text-align: center; cursor: pointer; }
    .option-pill.selected { border-color: var(--primary-color); background: white; }
    .confirm-btn { width: 100%; background: var(--primary-color); color: white; padding: 1.2rem; border-radius: var(--radius-md); font-weight: 800; cursor: pointer; }

    /* Animations */
    .animate-in { animation: fadeInUp 1s both; }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.4s; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 768px) {
      .section-header { flex-direction: column; align-items: flex-start; }
      .footer-grid { grid-template-columns: 1fr; text-align: center; gap: 3rem; }
      .footer-brand, .footer-nav, .footer-social-box { align-items: center; }
      .social-links { justify-content: center; }
    }
    `,
  ],
})
export class CatalogComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Todos'];
  activeCategory: string = 'Todos';
  settings: Settings | null = null;
  cartCount = 0;
  isCartAnimating = false;
  justAddedId: number | null = null;
  isCategoryMenuOpen = false;
  isNavCatOpen = false;
  isMobileMenuOpen = false;
  isCartOpen = false;
  isScrolled = false;
  categorySearchTerm = '';
  cartItems: any[] = [];
  isLoading = true;

  // Slider state
  currentSlide = 0;
  autoSlideTimer: any;
  heroSlides: HeroSlide[] = [
    { url: 'assets/hero1.png', title: 'Explora lo Nuevo' },
    { url: 'assets/hero2.png', title: 'Estilo y Calidad' },
  ];

  get filteredCategories() {
    if (!this.categorySearchTerm) return this.categories;
    const term = this.categorySearchTerm.toLowerCase();
    return this.categories.filter((c) => c.toLowerCase().includes(term));
  }

  storeSlug: string = '';

  constructor(
    private dataService: DataService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.storeSlug = params['slug'];
      this.loadStoreData();
    });

    this.cartService.cartItems$.subscribe((items) => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });
  }

  loadStoreData() {
    this.isLoading = true;
    this.dataService
      .getProductsBySlug(this.storeSlug)
      .pipe(
        catchError((err) => {
          console.error('Error al cargar productos de esta tienda', err);
          return of([]);
        }),
      )
      .subscribe((products) => {
        this.products = products;

        const cats = products
          .map((p) => p.category)
          .filter((c) => c && c.trim() !== '') as string[];
        const uniqueCats = [...new Set(cats)];
        this.categories = ['Todos', ...uniqueCats];

        this.applyFilters();
        this.startAutoSlide();
        if (this.settings) this.isLoading = false;
      });

    this.dataService
      .getSettingsBySlug(this.storeSlug)
      .pipe(
        catchError((err) => {
          console.error('Error cargando configuración de la tienda', err);
          return of({
            businessName: 'Mi Negocio',
            primaryColor: '#ff4081',
            secondaryColor: '#3f51b5',
            whatsappNumber: '573000000000',
            welcomeMessage: 'Hola',
          } as Settings);
        }),
      )
      .subscribe((settings) => {
        this.settings = settings;
        if (settings) {
          if (settings.heroSlides && settings.heroSlides?.length > 0) {
            this.heroSlides = settings.heroSlides;
          }
          // Applying fonts and colors via bindings is safer, but we can also set root vars for global components
          document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
          if (settings.accentColor) document.documentElement.style.setProperty('--accent-color', settings.accentColor);
          if (settings.fontFamily) document.documentElement.style.setProperty('--font-family', settings.fontFamily);
        }
        this.isLoading = false;
      });
    this.cartService.cartItems$.subscribe((items) => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });
  }

  selectedProduct: Product | null = null;
  tempOptions: { [key: string]: any } = {};

  getCombinedStyles() {
    if (!this.settings) return {};
    const styles: any = {
      'font-family': this.settings.fontFamily || "'Inter', sans-serif"
    };
    if (this.settings.backgroundColor) {
      styles['background-color'] = this.settings.backgroundColor;
    }
    return styles;
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((p) => {
      if (p.isActive === false) return false;
      if (this.activeCategory !== 'Todos') {
        return p.category === this.activeCategory;
      }
      return true;
    });
  }

  onAddClick(product: Product, event?: MouseEvent) {
    if (
      (product.variants && product.variants.length > 0) ||
      (product.specifications && product.specifications.length > 0)
    ) {
      this.selectedProduct = product;
      this.tempOptions = {};
    } else {
      this.onQuickAdd(product, event);
    }
  }

  onQuickAdd(product: Product, event?: MouseEvent) {
    this.addToCart(product);
    if (event) {
      this.triggerFlyAnimation(event);
    }

    this.isCartOpen = true; // Abrir el carrito al agregar
    this.justAddedId = product?.id;
    setTimeout(() => (this.justAddedId = null), 1500);
  }

  triggerFlyAnimation(event: MouseEvent) {
    const startX = event.clientX;
    const startY = event.clientY;

    const cartBtn = document.querySelector('.nav-cart-btn');
    if (!cartBtn) return;

    const rect = cartBtn.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    const particle = document.createElement('div');
    particle.className = 'fly-particle';
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.position = 'fixed';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.background = 'var(--primary-color)';
    particle.style.borderRadius = '50%';
    particle.style.zIndex = '9999';
    particle.style.pointerEvents = 'none';
    document.body.appendChild(particle);

    const animation = particle.animate(
      [
        { left: `${startX}px`, top: `${startY}px`, transform: 'scale(1)', opacity: 1 },
        { left: `${endX}px`, top: `${endY}px`, transform: 'scale(0.2)', opacity: 0 },
      ],
      {
        duration: 600,
        easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
      },
    );

    animation.onfinish = () => {
      particle.remove();
      this.isCartAnimating = true;
      setTimeout(() => (this.isCartAnimating = false), 400);
    };
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
    const optionsWithImage = Object.values(this.tempOptions).filter((opt) => opt.imageUrl);
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
    const optionsPrice = options.reduce((acc, opt) => acc + (opt.price || 0), 0);
    return this.selectedProduct.price + optionsPrice;
  }

  confirmAdd() {
    if (this.selectedProduct && this.isAllSelected()) {
      this.cartService.addToCart(this.selectedProduct, this.tempOptions);
      this.closeModal();
      this.isCartOpen = true; // Abrir carrito lateral
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
    this.isCartOpen = !this.isCartOpen;
  }

  getOptionsKey(options: any): string {
    return JSON.stringify(options || {});
  }

  updateCartQty(id: number, qty: number, options: any = {}) {
    this.cartService.updateQuantity(id, qty, this.getOptionsKey(options));
  }

  removeCartItem(id: number, options: any = {}) {
    this.cartService.removeFromCart(id, this.getOptionsKey(options));
  }

  getCartTotal() {
    return this.cartService.getTotalPrice();
  }

  goToCheckout() {
    this.router.navigate([`/${this.storeSlug}/cart`]);
    this.isCartOpen = false;
  }

  getOptionsKeys(options: any) {
    return Object.keys(options || {});
  }

  // Slider methods
  startAutoSlide() {
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides?.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
    clearInterval(this.autoSlideTimer);
    this.startAutoSlide();
  }

  scrollToProducts() {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }
}
