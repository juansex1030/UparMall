import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@shared/services/data.service';
import { CartService } from '@shared/services/cart.service';
import { Product, Settings, HeroSlide, CartItem } from '@shared/models/models';
import {
  LucideChevronDown,
  LucideX,
  LucideTrash2,
  LucideClock
} from '@lucide/angular';
import { catchError, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideChevronDown,
    LucideX,
    LucideClock,
    DecimalPipe
  ],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loader"></div>
    </div>

    <div class="store-layout" *ngIf="settings" [ngStyle]="combinedStyles" [class.modal-open]="!!selectedProduct || isCartOpen" 
         [style.--primary-color]="settings.primaryColor"
         [style.--secondary-color]="settings.secondaryColor || ''"
         [style.--accent-color]="settings.accentColor || ''"
         [style.--bg-color]="settings.backgroundColor || ''">

      <!-- NAVBAR -->
      <nav class="main-nav" [class]="settings.navbarStyle || 'glass'" [class.scrolled]="isScrolled">
        <div class="nav-container container">
          <div class="nav-left">
            <button class="menu-trigger" (click)="toggleMobileMenu()">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="nav-logo" (click)="scrollToTop()">
              <img [src]="settings.logoUrl || 'assets/default-logo.png'" alt="Logo" class="mini-logo" *ngIf="settings.logoUrl">
              <div class="logo-text-group">
                <span class="business-name">{{ settings.businessName }}</span>
                <div class="store-status-pill" [class.status-open]="isOpen" (click)="isScheduleModalOpen = true; $event.stopPropagation()">
                  <span class="status-dot"></span>
                  {{ isOpen ? 'Abierto ahora' : 'Cerrado' }}
                  <svg lucideClock size="10" style="margin-left: 4px;"></svg>
                </div>
              </div>
            </div>
          </div>

          <div class="nav-center">
            <a class="nav-link" (click)="scrollToTop()">Inicio</a>
            <a class="nav-link" (click)="scrollToProducts()">Catálogo</a>
          </div>

          <div class="nav-actions">
            <div class="search-wrapper" [class.active]="isSearchOpen">
              <input type="text" 
                     class="search-input" 
                     [(ngModel)]="productSearchTerm" 
                     (input)="applyFilters()"
                     placeholder="Buscar productos..."
                     #searchInput>
              <button class="search-btn" (click)="isSearchOpen = !isSearchOpen; isSearchOpen && searchInput.focus()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" *ngIf="!isSearchOpen"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" *ngIf="isSearchOpen"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <button class="nav-cart-btn" (click)="openCart()" [class.cart-pulse]="isCartAnimating">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span class="nav-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </button>
          </div>
        </div>
      </nav>


        <!-- MOBILE MENU OVERLAY -->
        <div class="mobile-menu-overlay" *ngIf="isMobileMenuOpen" (click)="closeMobileMenu()">
          <div class="mobile-menu" (click)="$event.stopPropagation()">
            <div class="mobile-menu-header">
              <span class="business-name">{{ settings.businessName }}</span>
              <button (click)="closeMobileMenu()">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="mobile-menu-body">
              <div class="mobile-section">
                <h6>Categorías</h6>
                <div class="mobile-cat-list">
                  <button *ngFor="let cat of categories" 
                          (click)="setCategory(cat); closeMobileMenu()"
                          [class.active]="activeCategory === cat">
                    {{ cat }}
                  </button>
                </div>
              </div>
              <div class="mobile-section">
                <h6>Enlaces</h6>
                <div class="mobile-nav-links">
                  <a (click)="scrollToTop(); isMobileMenuOpen = false">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Inicio
                  </a>
                  <a (click)="scrollToProducts(); isMobileMenuOpen = false">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    Catálogo
                  </a>
                  <a (click)="toggleCart(); isMobileMenuOpen = false">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    Mi Carrito
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- HERO SLIDER -->
      <section class="hero-slider" *ngIf="settings">
        <div class="slides-container" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
          <div class="slide" *ngFor="let slide of heroSlides">
            <img [src]="slide.url" [alt]="slide.title" class="slide-img">
            <div class="slide-overlay">
              <div class="slide-content">
                <h2 class="hero-title animate-in">{{ settings.businessName }}</h2>
                <button class="shop-now-btn animate-in delay-2" (click)="scrollToProducts()">
                  Explorar Catálogo
                </button>
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

      <!-- STICKY CATEGORY RIBBON (Now Below Banner) -->
      <div class="category-ribbon" [class.ribbon-scrolled]="isScrolled" [class.is-expanded]="isNavCatOpen">
        <div class="ribbon-container container">
          <div class="ribbon-inner">
            <button 
              *ngFor="let cat of categories" 
              class="ribbon-item" 
              [class.active]="activeCategory === cat"
              (click)="setCategory(cat)">
              {{ cat }}
            </button>
          </div>
          <button class="btn-ribbon-expand" (click)="isNavCatOpen = !isNavCatOpen">
            <span>{{ isNavCatOpen ? 'Cerrar' : 'Ver más' }}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" [style.transform]="isNavCatOpen ? 'rotate(180deg)' : ''"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
        
        <!-- Expanded Grid -->
        <div class="ribbon-expanded-grid container" *ngIf="isNavCatOpen">
          <button *ngFor="let cat of categories" 
                  (click)="setCategory(cat); isNavCatOpen = false"
                  class="grid-cat-item"
                  [class.active]="activeCategory === cat">
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="main-content" id="products-section">
        <div class="container">
          <div class="products-grid">
            <div class="glass-card" *ngFor="let product of filteredProducts" [class.just-added]="justAddedId === product.id">
              <div class="card-image-wrapper" (click)="onAddClick(product, $event)">
                <img [src]="product.imageUrl || 'assets/placeholder.png'" 
                     [alt]="product.name" 
                     loading="lazy"
                     #img
                     (load)="img.classList.add('loaded')">
                <span class="card-badge" *ngIf="product.category">{{ product.category }}</span>
                <div class="image-overlay">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ product.name }}</h3>
                <div class="card-footer">
                  <span class="card-price">
                    <span class="currency">$</span>
                    <span class="value">{{ product.price | number }}</span>
                  </span>
                  <button class="btn-main-action" (click)="onAddClick(product, $event)">
                    <span>+ Agregar</span>
                    <svg *ngIf="product.variants && product.variants.length > 0" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; opacity: 0.8;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ABOUT SECTION -->
      <section id="about-section" class="about-section container" *ngIf="settings.description">
        <div class="about-card glass">
          <div class="about-content">
            <h2 class="section-title">Sobre Nosotros</h2>
            <p class="about-text">{{ settings.description }}</p>
          </div>
          <div class="about-decoration" *ngIf="settings.logoUrl">
            <img [src]="settings.logoUrl" alt="Store Brand">
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer" *ngIf="settings">
        <div class="footer-container container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo-wrap">
                <img [src]="settings.logoUrl" alt="Logo" class="footer-logo" *ngIf="settings.logoUrl">
                <span class="footer-business-name">{{ settings.businessName }}</span>
              </div>
              <p class="footer-address" *ngIf="settings.address">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {{ settings.address }}
              </p>
              <div class="footer-socials" *ngIf="settings.socialLinks">
                <a *ngIf="settings.socialLinks.instagram" [href]="getSocialLink('instagram')" target="_blank" class="social-btn" title="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a *ngIf="settings.socialLinks.facebook" [href]="getSocialLink('facebook')" target="_blank" class="social-btn" title="Facebook">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a *ngIf="settings.socialLinks.twitter" [href]="getSocialLink('twitter')" target="_blank" class="social-btn" title="X (Twitter)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                </a>
                <a *ngIf="settings.socialLinks.tiktok" [href]="getSocialLink('tiktok')" target="_blank" class="social-btn" title="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.12-.85.38-1.44 1.12-1.54 2.03-.04.42-.04.85 0 1.27.12.75.52 1.47 1.15 1.86.6.38 1.34.46 2.03.31.84-.19 1.51-.8 1.8-1.57.14-.38.18-.79.18-1.2V2.61c.15-.86.11-1.73.11-2.59z"/></svg>
                </a>
              </div>
            </div>

            <div class="footer-group">
              <h5>Navegación</h5>
              <ul class="footer-links">
                <li><a (click)="scrollToTop()">Inicio</a></li>
                <li><a (click)="scrollToProducts()">Productos</a></li>
                <li><a (click)="toggleCart()">Mi Carrito</a></li>
              </ul>
            </div>

            <div class="footer-group">
              <h5>Ayuda</h5>
              <ul class="footer-links">
                <li><a (click)="scrollToAbout()">Sobre Nosotros</a></li>
                <li><a (click)="contactWhatsApp()">Contacto</a></li>
              </ul>
            </div>


          </div>

          <div class="footer-bottom">
            <p>&copy; 2026 {{ settings.businessName }}. Hecho con UparMall.</p>
            <div class="footer-legal">
              <a (click)="scrollToTop()">Privacidad</a>
              <span class="sep"></span>
              <a (click)="scrollToTop()">Cookies</a>
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
              <img [src]="displayImage" class="main-preview" />
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
              <span class="total-price">$ {{ modalTotal | number }}</span>
            </div>
            <button class="confirm-btn" (click)="confirmAdd($event)">
              Agregar al Carrito
            </button>
          </footer>
        </div>
      </div>
      <!-- SIDE CART DRAWER -->
      <div class="cart-drawer-overlay" *ngIf="isCartOpen" (click)="closeCart()">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <header class="cart-drawer-header">
            <h3>Tu Carrito ({{ cartCount }})</h3>
            <button class="close-btn" (click)="closeCart()">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </header>

          <div class="cart-drawer-body">
            <div class="empty-cart-msg" *ngIf="cartItems.length === 0">
              <p>Tu carrito está vacío</p>
              <button class="shop-btn" (click)="closeCart()">Seguir Comprando</button>
            </div>

            <div class="cart-drawer-items" *ngIf="cartItems.length > 0">
              <div class="cart-drawer-item" *ngFor="let item of cartItems">
                <div class="item-img-box">
                  <img [src]="getItemImage(item)" [alt]="item.product.name">
                </div>
                <div class="item-info">
                  <h4>{{ item.product.name }}</h4>
                  <p class="item-variants" *ngIf="getOptionsKeys(item.selectedOptions).length">
                    <span *ngFor="let key of getOptionsKeys(item.selectedOptions)">{{ key }}: {{ item.selectedOptions[key]?.label }} </span>
                  </p>
                  <p class="item-price">$ {{ getItemUnitPrice(item) | number }}</p>
                  <div class="item-qty-row">
                    <div class="qty-controls">
                      <button (click)="updateCartQty(item.product.id, item.quantity - 1, item.selectedOptions)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                      <span>{{ item.quantity }}</span>
                      <button (click)="updateCartQty(item.product.id, item.quantity + 1, item.selectedOptions)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                    <button class="item-remove" (click)="removeCartItem(item.product.id, item.selectedOptions)" title="Eliminar producto">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="trash-icon">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="cart-drawer-footer" *ngIf="cartItems.length > 0">
            <div class="cart-total-row">
              <span>Subtotal:</span>
              <span class="total-val">$ {{ cartTotal | number }}</span>
            </div>
            <button class="checkout-btn" (click)="goToCheckout()">
              Finalizar Pedido
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </footer>
        </div>
      </div>

      <!-- Schedule Modal -->
      <div class="modal-overlay" *ngIf="isScheduleModalOpen" (click)="isScheduleModalOpen = false">
        <div class="modal-content glass schedule-modal" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h3>Horario de Atención</h3>
            <button class="close-btn" (click)="isScheduleModalOpen = false"><svg lucideX size="24"></svg></button>
          </header>
          <div class="modal-body">
            <div class="schedule-list" *ngIf="settings.businessHours">
              <div *ngFor="let day of settings.businessHours" class="schedule-item" [class.is-today]="isToday(day.day)">
                <span class="day-label">{{ day.day }}</span>
                <span class="time-range" *ngIf="day.enabled">{{ day.open }} - {{ day.close }}</span>
                <span class="time-range closed-text" *ngIf="!day.enabled">Cerrado</span>
              </div>
            </div>
            
            <div class="address-notice" *ngIf="settings.address">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{{ settings.address }}</span>
            </div>
            
            <div class="status-notice" [class.notice-open]="isOpen">
              <svg lucideClock size="18"></svg>
              <span>{{ isOpen ? '¡Estamos atendiendo en este momento!' : 'Actualmente nos encontramos fuera de horario laboral.' }}</span>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="confirm-btn" (click)="isScheduleModalOpen = false">Entendido</button>
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
      overflow-x: hidden; width: 100%; position: relative;
      border-radius: 0; /* Ensures corners touch the browser edges */
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
      transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); padding: 18px 0;
      border-radius: 0; /* Flush with screen corners */
    }
    .main-nav.glass { 
      background: rgba(255,255,255,0.7); 
      backdrop-filter: blur(20px) saturate(180%); 
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    .main-nav.solid { background: var(--primary-color); color: white; border-bottom: none; }
    .main-nav.minimal { background: transparent; }
    .main-nav.scrolled { padding: 12px 0; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-radius: 0; }
    .main-nav.scrolled.glass { background: rgba(255,255,255,0.85); }
    
    .main-nav.solid .business-name, 
    .main-nav.solid .nav-link, 
    .main-nav.solid .menu-trigger,
    .main-nav.solid .nav-cat-btn { color: white; }
    .main-nav.solid .nav-badge { background: white; color: var(--primary-color); }
    
    .nav-container { display: flex; justify-content: space-between; align-items: center; position: relative; }
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
    
    .search-wrapper {
      display: flex;
      align-items: center;
      gap: 0;
      position: relative;
    }
    .search-input {
      width: 0;
      opacity: 0;
      padding: 0;
      border: 2px solid var(--primary-color);
      border-right: none;
      border-radius: 12px 0 0 12px;
      height: 44px;
      outline: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
      font-size: 0.9rem;
      background: white;
    }
    .search-wrapper.active .search-input {
      width: 200px;
      opacity: 1;
      padding: 0 15px;
    }
    .search-wrapper.active .search-btn {
      border-radius: 0 12px 12px 0;
    }

    @media (max-width: 768px) {
      .search-wrapper.active {
        position: absolute;
        right: 0;
        top: 0;
        z-index: 1100;
        width: 100%;
        background: inherit; /* Matches navbar glass/solid */
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 15px;
        box-sizing: border-box;
      }
      .search-wrapper.active .search-input {
        width: 100%;
        border-radius: 100px;
        border-right: 2px solid var(--primary-color);
        padding-right: 50px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .search-wrapper.active .search-btn {
        position: absolute;
        right: 25px;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
        color: var(--primary-color) !important;
      }
      .search-wrapper.active .search-btn svg {
        stroke: var(--primary-color) !important;
      }
    }

    .nav-actions { display: flex; align-items: center; gap: 10px; }
    
    @media (max-width: 768px) {
      .nav-actions { position: static; }
    }

    .menu-trigger, .search-btn, .nav-cart-btn {
      display: flex;
      width: 44px; height: 44px; border-radius: 12px; border: 2px solid var(--primary-color);
      background: white; color: var(--primary-color);
      align-items: center; justify-content: center;
      cursor: pointer; transition: 0.3s; position: relative;
      box-shadow: var(--shadow-soft);
      padding: 0 !important;
      min-height: unset !important;
      overflow: visible;
    }
    .menu-trigger svg, .search-btn svg, .nav-cart-btn svg {
      stroke: var(--primary-color);
      display: block;
      flex-shrink: 0;
      transition: 0.3s;
    }
    @media (min-width: 992px) {
      .menu-trigger { display: none !important; }
    }
    .menu-trigger:hover, .search-btn:hover, .nav-cart-btn:hover { background: var(--primary-color); color: white; transform: scale(1.05); }
    .menu-trigger:hover svg, .search-btn:hover svg, .nav-cart-btn:hover svg { stroke: white; }
    .nav-badge {
      position: absolute; top: -5px; right: -5px; background: var(--primary-color, #ef4444);
      color: white; font-size: 0.65rem; min-width: 18px; height: 18px; padding: 0 4px;
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-weight: 900; border: 2px solid white;
    }

    /* Mobile Menu */
    .mobile-menu-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75);
      z-index: 5000; display: flex;
      contain: layout style;
    }
    .mobile-menu {
      width: 80%; max-width: 320px; height: 100%; background: white;
      display: flex; flex-direction: column; animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    .mobile-menu-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
    .mobile-menu-header button { padding: 0 !important; min-height: unset !important; width: 40px; height: 40px; overflow: visible; }
    .mobile-menu-body { padding: 30px; overflow-y: auto; flex: 1; }
    .mobile-section { margin-bottom: 40px; }
    .mobile-section h6 { font-size: 0.7rem; text-transform: uppercase; color: #bbb; letter-spacing: 3px; margin-bottom: 20px; }
    .mobile-cat-list { display: flex; flex-direction: column; gap: 8px; }
    .mobile-cat-list button.active { background: var(--primary-color); color: white; }
    
    .mobile-nav-links { display: flex; flex-direction: column; gap: 10px; }
    .mobile-nav-links a { 
      display: flex; align-items: center; gap: 12px; padding: 15px 20px; 
      background: #f8f9fa; border-radius: 14px; color: #1a1a1a; 
      font-weight: 700; text-decoration: none; transition: 0.3s;
    }
    .mobile-nav-links a:hover { background: #eee; transform: translateX(5px); }
    .mobile-nav-links a svg { color: var(--primary-color); opacity: 0.7; }

    /* Hero Slider Compact Redesign */
    .hero-slider { 
      width: 100%; 
      height: clamp(350px, 50vh, 500px); 
      position: relative; 
      overflow: hidden; 
      background: #000;
    }
    .slides-container { display: flex; height: 100%; transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1); will-change: transform; }
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

    @media (min-width: 992px) {
      .slide-overlay {
        align-items: flex-start;
        padding-top: 120px;
        justify-content: flex-start;
      }
      .slide-content {
        padding-left: 10%;
        margin: 0;
        max-width: 700px;
      }
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

    /* Category Ribbon */
    .category-ribbon {
      position: sticky; top: 74px; background: rgba(255,255,255,0.8);
      backdrop-filter: blur(20px); z-index: 900; border-bottom: 1px solid rgba(0,0,0,0.05);
      padding: 12px 0; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ribbon-container { display: flex; align-items: center; gap: 15px; }
    .ribbon-inner {
      flex: 1; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
      padding: 4px 0;
    }
    .ribbon-inner::-webkit-scrollbar { display: none; }
    
    .ribbon-item {
      white-space: nowrap; padding: 10px 22px; border-radius: 100px;
      background: white; border: 1px solid rgba(0,0,0,0.08);
      font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
      color: #555; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .ribbon-item:hover { border-color: var(--primary-color); color: var(--primary-color); transform: translateY(-2px); }
    .ribbon-item.active { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    
    .btn-ribbon-expand {
      background: #f4f4f4; border: none; padding: 10px 18px; border-radius: 12px;
      display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.8rem;
      cursor: pointer; transition: 0.3s; color: #1a1a1a;
    }
    .btn-ribbon-expand:hover { background: #eee; transform: scale(1.05); }

    .ribbon-expanded-grid {
      padding-top: 25px; padding-bottom: 15px;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;
      animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .grid-cat-item {
      padding: 15px; background: #f9f9f9; border: 1px solid #eee; border-radius: 15px;
      font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
    }
    .grid-cat-item:hover { background: white; border-color: var(--primary-color); color: var(--primary-color); box-shadow: var(--shadow-soft); }
    .grid-cat-item.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }

    /* Compact Grid */
    .products-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
      gap: 1.5rem; 
      padding-top: 2rem;
    }
    .glass-card {
      background: rgba(255,255,255,0.8); backdrop-filter: blur(15px); border-radius: 24px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.4); transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
      display: flex; flex-direction: column; position: relative;
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
    }
    .glass-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(0,0,0,0.12); border-color: var(--primary-color); }
    
    .card-image-wrapper { 
      position: relative; 
      aspect-ratio: 1/1; 
      background: #f6f7f8;
      background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
      background-size: 800px 104px;
      animation: skeleton-shimmer 2s infinite linear;
      padding: 1.2rem;
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      overflow: hidden;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: -468px 0; }
      100% { background-position: 468px 0; }
    }
    .card-image-wrapper img { 
      width: 100%; 
      height: 100%; 
      object-fit: contain; 
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }
    .card-image-wrapper img.loaded { opacity: 1; }
    
    .card-badge { 
      position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); color: white; 
      padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.65rem;
      text-transform: uppercase;
    }

    .card-body { padding: 1.2rem; flex-grow: 1; display: flex; flex-direction: column; gap: 10px; }
    .card-title { font-size: 1rem; font-weight: 800; color: #1a1a1a; line-height: 1.3; margin: 0; min-height: 2.6rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; gap: 8px; }
    .card-price { 
      font-size: 1.1rem; font-weight: 950; color: var(--primary-color); 
      white-space: nowrap; display: flex; align-items: center; gap: 2px;
    }
    
    .btn-main-action { 
      padding: 10px 18px; border-radius: 14px; background: var(--primary-color); 
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
      color: white; border: none; font-weight: 800; font-size: 0.85rem;
      white-space: nowrap; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .btn-main-action:hover { transform: scale(1.08); box-shadow: 0 8px 25px rgba(0,0,0,0.2); filter: brightness(1.1); }

    .image-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: 0.3s;
    }
    .card-image-wrapper:hover .image-overlay { opacity: 1; }

    @media (max-width: 768px) {
      .container { padding: 0 15px; }
      .main-nav { 
        padding: 10px 15px; 
        border-radius: 0; /* Full width for immersive look */
        width: 100%;
        left: 0;
      }
      .nav-container { max-width: 100%; width: 100%; padding: 0; }
      .nav-center { display: none !important; } /* Hidden on mobile to avoid overcrowding */
      .nav-left { gap: 10px; }
      .mini-logo { width: 32px; height: 32px; }
      .business-name { font-size: 1rem; white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
      
      .nav-actions { gap: 6px; }
      .menu-trigger, .search-btn, .nav-cart-btn { width: 40px; height: 40px; border-width: 1.5px; }
      
      .hero-slider { height: 320px; }
      .hero-title { font-size: 2.4rem; margin-bottom: 0.8rem; }
      .hero-subtitle { font-size: 0.95rem; margin-bottom: 1.5rem; }
      .shop-now-btn { padding: 1rem 2rem; font-size: 0.85rem; }

      .category-ribbon { top: 60px; padding: 8px 0; }
      .ribbon-container { gap: 10px; }
      .ribbon-inner { scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
      .ribbon-item { 
        padding: 8px 16px; font-size: 0.8rem; 
        scroll-snap-align: start;
      }
      .btn-ribbon-expand { padding: 8px 12px; font-size: 0.75rem; }
      .btn-ribbon-expand span { display: none; } /* Hide text on small mobile */

      .ribbon-expanded-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; padding-top: 15px; }
      .grid-cat-item { padding: 12px; font-size: 0.8rem; }

      .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding-top: 1.5rem; }
      .glass-card { border-radius: 20px; }
      .card-image-wrapper { padding: 10px; border-radius: 16px; }
      .card-body { padding: 12px; gap: 8px; }
      .card-title { font-size: 0.85rem; min-height: 2.2rem; line-height: 1.2; margin-bottom: 4px; }
      .card-price { font-size: 0.95rem; font-weight: 900; }
      .btn-main-action { padding: 8px 10px; font-size: 0.7rem; border-radius: 10px; flex: 1; }
      
      .footer { padding: 60px 20px !important; background: #0a0a0b !important; }
      .footer-grid { 
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        gap: 40px !important; 
        width: 100% !important;
      }
      .footer-brand, .footer-group { 
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important; 
      }
      .footer-group h5 { 
        margin: 0 0 20px 0 !important; 
        font-size: 1rem !important;
        text-align: center !important;
      }
      .footer-links { 
        padding: 0 !important; 
        text-align: center !important;
        align-items: center !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .footer-socials { justify-content: center !important; margin-top: 10px !important; }
      .footer-bottom { 
        flex-direction: column !important; 
        gap: 15px !important; 
        text-align: center !important;
        padding-top: 40px !important;
        border-top: 1px solid rgba(255,255,255,0.05) !important;
      }
      .footer-legal { justify-content: center !important; flex-wrap: wrap !important; gap: 15px !important; }
      .footer-brand p { margin: 15px auto !important; max-width: 280px !important; }
    }
    
    /* Specific for Notch/Safe Areas (iPhone 14 etc) */
    @supports (padding: env(safe-area-inset-top)) {
      .main-nav { padding-top: calc(12px + env(safe-area-inset-top)); }
      .category-ribbon.ribbon-scrolled { top: calc(60px + env(safe-area-inset-top)); }
      .cart-drawer-footer, .modal-footer { padding-bottom: calc(25px + env(safe-area-inset-bottom)); }
    }

    /* Modal & Specs */
    .modal-overlay { 
      position: fixed; inset: 0; background: rgba(0,0,0,0.78); 
      z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px;
      contain: layout style;
    }
    .modal-content { 
      width: 95%; max-width: 600px; max-height: 90vh; background: white; 
      border-radius: 30px; display: flex; flex-direction: column; overflow: hidden;
      transform: translateZ(0);
    }
    .modal-header { padding: 25px 30px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .close-btn { padding: 0 !important; min-height: unset !important; width: 40px; height: 40px; background: #f4f4f4; border-radius: 10px; overflow: visible; }
    .modal-body { 
      padding: 30px; overflow-y: auto; flex: 1;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .modal-preview-image { width: 100%; max-height: 250px; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; background: #f8f8f8; border-radius: 15px; overflow: hidden; }
    .modal-preview-image img { width: 100%; height: 100%; object-fit: contain; }
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

    /* Specs - kept here for the option pills used in both modal blocks */
    .option-pill { background: #f9f9f9; border: 2px solid #eee; padding: 1rem; border-radius: var(--radius-md); flex: 1 1 120px; text-align: center; cursor: pointer; }
    .option-pill.selected { border-color: var(--primary-color); background: white; }
    .confirm-btn { width: 100%; background: var(--primary-color); color: white; padding: 1.2rem; border-radius: var(--radius-md); font-weight: 800; cursor: pointer; }

    /* Animations */
    .animate-in { animation: fadeInUp 1s both; }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.4s; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    /* Lateral Cart Drawer */
    .cart-drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
      z-index: 4000; display: flex; justify-content: flex-end;
      animation: fadeIn 0.3s ease;
    }
    .cart-drawer {
      width: 100%; max-width: 450px; height: 100%; background: white;
      display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1);
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .cart-drawer-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
    .cart-drawer-header h3 { margin: 0; font-size: 1.5rem; font-weight: 900; }
    .cart-drawer-body { flex: 1; overflow-y: auto; padding: 30px; }
    
    .empty-cart-msg { text-align: center; padding-top: 100px; color: #888; }
    .shop-btn { margin-top: 20px; background: #1a1a1a; color: white; padding: 12px 30px; border-radius: 100px; font-weight: 700; border: none; cursor: pointer; }
    
    .cart-drawer-item { display: flex; gap: 20px; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #f8f8f8; }
    .item-img-box { width: 80px; height: 80px; background: #f9f9f9; border-radius: 15px; overflow: hidden; flex-shrink: 0; }
    .item-img-box img { width: 100%; height: 100%; object-fit: contain; }
    .item-info { flex: 1; }
    .item-info h4 { margin: 0 0 5px; font-size: 1.1rem; font-weight: 800; }
    .item-variants { margin: 0 0 10px; font-size: 0.85rem; color: #666; font-weight: 600; }
    .item-price { 
      font-weight: 900; color: var(--primary-color); font-size: 1.1rem; margin: 0 0 10px; 
      display: flex; align-items: center; gap: 3px; white-space: nowrap;
    }
    
    .item-qty-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-top: 12px; }
    .qty-controls { 
      display: flex; align-items: center; background: #f5f5f7; 
      padding: 6px 12px; border-radius: 12px; gap: 18px; 
    }
    .qty-controls button { background: none; border: none; padding: 0; cursor: pointer; font-weight: 900; display: flex; align-items: center; }
    .qty-controls span { font-weight: 800; min-width: 20px; text-align: center; font-size: 0.95rem; color: #1a1a1a; }
    .item-remove { 
      background: #fff1f1; color: #ff3b30; border: none; 
      width: 42px; height: 42px; border-radius: 12px; 
      cursor: pointer; display: flex; align-items: center; justify-content: center; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(255, 59, 48, 0.05);
      position: relative; overflow: visible;
      padding: 0; z-index: 5;
    }
    /* Limpieza total de posibles interferencias */
    .item-remove::after, .item-remove::before { content: none !important; display: none !important; }
    
    .item-remove:hover { 
      background: #ff3b30; color: #ffffff !important; 
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 8px 20px rgba(255, 59, 48, 0.2);
    }
    .item-remove .trash-icon { 
      width: 20px; height: 20px; 
      stroke: currentColor; 
      pointer-events: none;
      display: block;
    }

    .cart-drawer-footer { padding: 30px; background: #fafafa; border-top: 1px solid #f0f0f0; }
    .cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .cart-total-row span { font-size: 1.1rem; font-weight: 700; color: #666; }
    .total-val { font-size: 1.8rem !important; font-weight: 950 !important; color: #1a1a1a !important; }
    .checkout-btn { width: 100%; height: 60px; background: var(--primary-color); color: white; border-radius: 15px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; border: none; font-size: 1.1rem; }

    /* Fly Animation & Pulse */
    .fly-particle {
      position: fixed; pointer-events: none; z-index: 9999;
      background: var(--primary-color); border-radius: 50%;
      box-shadow: 0 0 10px var(--primary-color);
    }
    .cart-pulse { animation: pulse 0.4s ease-out; }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); border-color: var(--primary-color); }
      100% { transform: scale(1); }
    }


    /* About Section */
    .about-section { padding: 80px 0; }
    .about-card { 
      padding: 60px; border-radius: 40px; display: flex; align-items: center; gap: 60px;
      background: rgba(255,255,255,0.6) !important;
    }
    .about-content { flex: 1; }
    .about-text { font-size: 1.25rem; line-height: 1.8; color: #444; font-weight: 500; }
    .about-decoration { width: 180px; height: 180px; flex-shrink: 0; opacity: 0.2; filter: grayscale(1); }
    .about-decoration img { width: 100%; height: 100%; object-fit: contain; }

    @media (max-width: 768px) {
      .about-card { flex-direction: column; padding: 40px 25px; gap: 30px; text-align: center; }
      .about-text { font-size: 1.05rem; }
      .about-decoration { width: 120px; height: 120px; }
    }

    /* Footer Styles */
    .footer { 
      background: #0a0a0b !important; color: white !important; padding: 80px 0 40px; 
      position: relative; overflow: hidden; margin-top: 100px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .footer-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
    .footer-logo-wrap { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    .footer-logo { width: 50px !important; height: 50px !important; border-radius: 12px; object-fit: cover; }
    .footer-business-name { font-size: 1.4rem; font-weight: 950; color: white; letter-spacing: -0.5px; }
    .footer-tagline { color: rgba(255,255,255,0.5); font-size: 0.95rem; line-height: 1.6; margin-bottom: 25px; max-width: 300px; }
    
    .footer-socials { display: flex; gap: 10px; }
    .footer-group h5 { color: white; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 25px; font-weight: 700; }
    .footer-links { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .footer-links a { color: rgba(255,255,255,0.5); text-decoration: none; cursor: pointer; transition: 0.2s; }
    .footer-links a:hover { color: var(--primary-color); }
    
    .footer-bottom { 
      padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05);
      display: flex; justify-content: space-between; align-items: center;
      color: rgba(255,255,255,0.3); font-size: 0.9rem;
    }

    /* Store Status Badge */
    .logo-text-group { display: flex; flex-direction: column; line-height: 1.1; }
    .store-status-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 8px; border-radius: 50px; font-size: 0.65rem; font-weight: 800;
      background: #fee2e2; color: #ef4444; border: 1px solid #fecaca;
      cursor: pointer; transition: 0.2s; width: fit-content; margin-top: 2px;
    }
    .status-open { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .store-status-pill:hover { transform: scale(1.05); }

    /* Schedule Modal */
    .schedule-modal { max-width: 400px !important; }
    .schedule-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
    .schedule-item { 
      display: flex; justify-content: space-between; padding: 12px 15px; 
      border-radius: 12px; background: #f8fafc; border: 1px solid #eee;
    }
    .schedule-item.is-today { background: #f0f7ff; border-color: var(--primary-color); font-weight: 800; }
    .day-label { color: #64748b; font-weight: 700; }
    .is-today .day-label { color: var(--primary-color); }
    .time-range { font-weight: 800; color: #1a1a1a; }
    .closed-text { color: #ef4444; font-style: italic; }
    .status-notice {
      display: flex; align-items: center; gap: 12px; padding: 15px;
      border-radius: 12px; font-size: 0.85rem; font-weight: 700;
      background: #f1f5f9; color: #64748b; margin-top: 20px;
    }
    .notice-open { background: #f0fdf4; color: #166534; }

    .footer-address {
      color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-top: -10px; margin-bottom: 25px;
      display: flex; align-items: center;
    }

    .address-notice {
      display: flex; align-items: center; gap: 12px; padding: 15px;
      border-radius: 12px; font-size: 0.85rem; font-weight: 700;
      background: #f8fafc; color: #64748b; border: 1px dashed #cbd5e1;
      margin-bottom: 15px;
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
  isOpen = false;
  isScheduleModalOpen = false;
  isSearchOpen = false;
  productSearchTerm = '';

  // Cached computed values (avoids method calls in template)
  combinedStyles: any = {};
  displayImage = '';
  modalTotal = 0;
  cartTotal = 0;
  private _subs: Subscription[] = [];

  // Cached slice for nav dropdown (avoids slice() on every CD cycle)
  navCategories: string[] = [];
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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this._subs.push(this.route.params.subscribe(params => {
      this.storeSlug = params['slug'];
      this.loadStoreData();
    }));

    // Single subscription — precomputes _optionKeys and cartTotal
    this._subs.push(this.cartService.cartItems$.subscribe((items) => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
      this.cartItems = items.map((item: any) => ({
        ...item,
        _optionKeys: Object.keys(item.selectedOptions || {})
      }));
      this.cartTotal = this.cartService.getTotalPrice();
      this.cdr.markForCheck();
    }));

    // Interval to refresh store status every minute
    this.ngZone.runOutsideAngular(() => {
      const timer = setInterval(() => {
        this.ngZone.run(() => this.checkStoreStatus());
      }, 60000);
      this._subs.push(new Subscription(() => clearInterval(timer)));
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
        this.navCategories = this.categories.slice(1, 7); // top 6 non-'Todos' categories
        this.applyFilters();
        this.startAutoSlide();
        if (this.settings) this.isLoading = false;
        this.cdr.markForCheck();
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
          document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
          if (settings.accentColor) document.documentElement.style.setProperty('--accent-color', settings.accentColor);
          if (settings.fontFamily) document.documentElement.style.setProperty('--font-family', settings.fontFamily);
          // Cache combined styles once — avoids method call on every CD cycle
          this.combinedStyles = {
            'font-family': settings.fontFamily || "'Inter', sans-serif",
            ...(settings.backgroundColor ? { 'background-color': settings.backgroundColor } : {})
          };
        }
        this.isLoading = false;
        this.checkStoreStatus();
        this.cdr.markForCheck();
      });
  }

  checkStoreStatus() {
    if (!this.settings?.businessHours || this.settings.businessHours.length === 0) {
      this.isOpen = true;
      return;
    }

    const now = new Date();
    const dayName = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    
    const daysMap: any = {
      'lunes': 'Lunes', 'martes': 'Martes', 'miércoles': 'Miércoles', 'jueves': 'Jueves',
      'viernes': 'Viernes', 'sábado': 'Sábado', 'domingo': 'Domingo'
    };

    const currentDay = this.settings.businessHours.find(d => d.day === daysMap[dayName]);
    
    if (!currentDay || !currentDay.enabled) {
      this.isOpen = false;
      return;
    }

    const [openH, openM] = currentDay.open.split(':').map(Number);
    const [closeH, closeM] = currentDay.close.split(':').map(Number);
    
    const openTime = new Date(now);
    openTime.setHours(openH, openM, 0);
    
    const closeTime = new Date(now);
    closeTime.setHours(closeH, closeM, 0);

    this.isOpen = now >= openTime && now <= closeTime;
    this.cdr.markForCheck();
  }

  isToday(day: string): boolean {
    const now = new Date();
    const dayName = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const daysMap: any = {
      'lunes': 'Lunes', 'martes': 'Martes', 'miércoles': 'Miércoles', 'jueves': 'Jueves',
      'viernes': 'Viernes', 'sábado': 'Sábado', 'domingo': 'Domingo'
    };
    return daysMap[dayName] === day;
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
      
      const matchesCategory = this.activeCategory === 'Todos' || p.category === this.activeCategory;
      
      const searchLower = this.productSearchTerm.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        p.name.toLowerCase().includes(searchLower) || 
        (p.category && p.category.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });
    this.cdr.markForCheck();
  }

  onAddClick(product: Product, event?: MouseEvent) {
    if (
      (product.variants && product.variants.length > 0) ||
      (product.specifications && product.specifications.length > 0)
    ) {
      this.selectedProduct = product;
      this.tempOptions = {};
      this._updateModalState();
      this._pauseSlider(); // stop slider while modal is open
    } else {
      this.onQuickAdd(product, event);
    }
  }

  onQuickAdd(product: Product, event?: MouseEvent) {
    this.addToCart(product);
    if (event) {
      this.triggerFlyAnimation(event);
    }
    // No longer opens cart automatically as per user request
    this.justAddedId = product?.id;
    this.cdr.markForCheck(); // OnPush: show highlight immediately
    setTimeout(() => {
      this.justAddedId = null;
      this.cdr.markForCheck(); // OnPush: remove highlight
    }, 1500);
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
      this.ngZone.run(() => {
        this.isCartAnimating = true;
        this.cdr.markForCheck(); // OnPush: show cart pulse
        setTimeout(() => {
          this.isCartAnimating = false;
          this.cdr.markForCheck(); // OnPush: remove pulse
        }, 400);
      });
    };
  }

  selectOption(variantName: string, option: any) {
    if (this.tempOptions[variantName]?.label === option.label) {
      const newOptions = { ...this.tempOptions };
      delete newOptions[variantName];
      this.tempOptions = newOptions;
    } else {
      this.tempOptions = { ...this.tempOptions, [variantName]: option };
    }
    this._updateModalState();
  }

  private _updateModalState() {
    if (!this.selectedProduct) { this.displayImage = ''; this.modalTotal = 0; return; }

    // 1. Update Display Image
    const optionsWithImage = Object.values(this.tempOptions).filter((opt: any) => opt.imageUrl);
    this.displayImage = optionsWithImage.length > 0
      ? (optionsWithImage[optionsWithImage.length - 1] as any).imageUrl
      : (this.selectedProduct.imageUrl || 'https://via.placeholder.com/300');

    // 2. Calculate Total using the centralized Max Price logic
    this.calculateModalTotal();
    this.cdr.markForCheck();
  }

  isAllSelected(): boolean {
    return true; // Ahora las variantes son opcionales
  }

  confirmAdd(event?: MouseEvent) {
    if (this.selectedProduct && this.isAllSelected()) {
      // Ensure prices are captured correctly before sending to service
      const cleanOptions: any = {};
      Object.keys(this.tempOptions).forEach(key => {
        const opt = this.tempOptions[key];
        cleanOptions[key] = {
          ...opt,
          price: Number(opt.price) || 0
        };
      });

      this.cartService.addToCart(this.selectedProduct, cleanOptions);
      if (event) this.triggerFlyAnimation(event);
      this.closeModal();
    }
  }

  closeModal() {
    this.selectedProduct = null;
    this.tempOptions = {};
    this._resumeSlider(); // restart slider when modal closes
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) this._pauseSlider();
    else this._resumeSlider();
    this.cdr.markForCheck();
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this._resumeSlider();
    this.cdr.markForCheck();
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) this._pauseSlider();
    else this._resumeSlider();
    this.cdr.markForCheck();
  }

  openCart() {
    this.isCartOpen = true;
    this._pauseSlider();
    this.cdr.markForCheck();
  }

  closeCart() {
    this.isCartOpen = false;
    this._resumeSlider();
    this.cdr.markForCheck();
  }

  getOptionsKey(options: any): string {
    return this.cartService.getStableOptionsKey(options);
  }

  private _pauseSlider() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  private _resumeSlider() {
    this._pauseSlider(); // clear any existing before starting
    this.startAutoSlide();
  }

  updateCartQty(id: number, qty: number, options: any = {}) {
    this.cartService.updateQuantity(id, qty, this.cartService.getOptionsKey(options));
  }

  removeCartItem(id: number, options: any = {}) {
    this.cartService.removeFromCart(id, this.cartService.getOptionsKey(options));
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

  getSocialLink(platform: string): string {
    if (!this.settings || !this.settings.socialLinks) return 'javascript:void(0)';
    const links = this.settings.socialLinks as any;
    let val = links[platform];
    if (!val) return 'javascript:void(0)';
    
    val = val.trim();
    if (val.startsWith('http')) return val;
    if (val.startsWith('www.')) return 'https://' + val;
    
    const domainMap: any = {
      instagram: 'instagram.com',
      facebook: 'facebook.com',
      twitter: 'x.com',
      tiktok: 'tiktok.com'
    };

    if (val.includes(domainMap[platform])) {
      return 'https://' + val;
    }
    
    switch (platform) {
      case 'instagram': return `https://instagram.com/${val}`;
      case 'facebook': return `https://facebook.com/${val}`;
      case 'twitter': return `https://x.com/${val}`;
      case 'tiktok': return `https://tiktok.com/@${val.replace('@', '')}`;
      default: return 'javascript:void(0)';
    }
  }

  calculateModalTotal() {
    if (!this.selectedProduct) return;
    const variantPrices = Object.values(this.tempOptions).map((opt: any) => Number(opt.price) || 0);
    const maxVariantPrice = Math.max(0, ...variantPrices);
    this.modalTotal = maxVariantPrice > 0 ? maxVariantPrice : (Number(this.selectedProduct.price) || 0);
  }

  getItemUnitPrice(item: CartItem): number {
    return this.cartService.getItemUnitPrice(item);
  }

  getItemImage(item: CartItem): string {
    return this.cartService.getItemImage(item);
  }

  // Slider methods
  startAutoSlide() {
    this.ngZone.runOutsideAngular(() => {
      this.autoSlideTimer = setInterval(() => {
        this.ngZone.run(() => this.nextSlide());
      }, 5000);
    });
  }

  nextSlide() {
    if (!this.heroSlides || this.heroSlides.length === 0) return;
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
    clearInterval(this.autoSlideTimer);
    this.startAutoSlide();
  }

  scrollToAbout() {
    document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  contactWhatsApp() {
    if (!this.settings?.whatsappNumber) return;
    const msg = encodeURIComponent('¡Hola! Necesito soporte o tengo una duda sobre la tienda.');
    window.open(`https://wa.me/${this.settings.whatsappNumber}?text=${msg}`, '_blank');
  }

  scrollToProducts() {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    this._subs.forEach(s => s.unsubscribe());
  }
}
