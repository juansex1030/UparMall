import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { DataService } from '@shared/services/data.service';
import { AuthService } from '@shared/services/auth.service';
import { Subscription } from 'rxjs';
import { Product, Settings } from '@shared/models/models';
import { LucidePlus, LucideSquarePen, LucideTrash2, LucideSave, LucideX, LucideUpload, LucideEye, LucideEyeOff, LucideSettings, LucidePalette, LucideImage, LucideShare2, LucideCheckCircle, LucideCircleOff, LucideClock } from '@lucide/angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucidePlus, LucideSquarePen, LucideTrash2, LucideSave, LucideX, LucideUpload, LucideEye, LucideEyeOff, LucideSettings, LucidePalette, LucideImage, LucideShare2, LucideCheckCircle, LucideCircleOff, LucideClock],
  template: `
    <div class="admin-container">
      <!-- Loading State -->
      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="glass-panel" style="text-align: center; padding: 60px;">
          <div class="spinner" style="margin: 0 auto 20px;"></div>
          <h2 style="font-weight: 900; color: #0f172a;">Cargando Panel...</h2>
          <p style="color: #64748b;">Estamos preparando tu panel de administración</p>
        </div>
      </div>

      <!-- Error State -->
      <div class="loading-overlay" *ngIf="!isLoading && !settings">
        <div class="glass-panel" style="text-align: center; padding: 60px; border-color: #fecaca; background: #fff5f5;">
          <svg lucideCircleOff size="48" style="color: #ef4444; margin-bottom: 20px;"></svg>
          <h2 style="font-weight: 900; color: #991b1b;">Error de Conexión</h2>
          <p style="color: #b91c1c; margin-bottom: 30px;">No pudimos conectar con tu servidor local. Asegúrate de que el backend esté corriendo.</p>
          <button (click)="loadSettings()" class="btn-action btn-dark" style="margin: 0 auto;">
            Reintentar Conexión
          </button>
        </div>
      </div>

      <div *ngIf="settings && !isLoading">
      <header class="admin-header">
        <div class="header-main">
          <div class="header-info">
            <h2>Panel de Control</h2>
          </div>
          <div class="header-actions">
            <button class="btn-action btn-light" (click)="goToMyStore()">
              <svg lucideEye size="18"></svg> Ver Tienda
            </button>
            <button class="btn-action btn-dark" (click)="logout()">
              <svg lucideX size="18"></svg> Salir
            </button>
          </div>
        </div>

        <div class="tabs-container">
          <div class="tabs">
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'products'" 
              (click)="activeTab = 'products'; showForm = false">
              <svg lucidePlus size="18"></svg> Inventario
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'settings'" 
              (click)="activeTab = 'settings'">
              <svg lucideSettings size="18"></svg> Personalización
            </button>
            <button 
              *ngIf="isSuperAdmin"
              class="tab-btn" 
              [class.active]="activeTab === 'master'" 
              (click)="activeTab = 'master'">
              <svg lucidePalette size="18"></svg> Master Control
            </button>
          </div>

          <button 
            *ngIf="activeTab === 'settings'"
            class="preview-toggle" 
            [class.active]="isPreviewActive"
            (click)="isPreviewActive = !isPreviewActive">
            <svg lucideEye size="18"></svg> {{ isPreviewActive ? 'Ocultar Vista Previa' : 'Ver Vista Previa' }}
          </button>

          <button 
            *ngIf="activeTab === 'products' && !showForm"
            class="btn-action btn-dark" 
            (click)="openAddForm()">
            <svg lucidePlus size="18"></svg> Nuevo Producto
          </button>
        </div>
      </header>
      
      <!-- Integrated Notification Banner -->
      <div class="toast-wrapper" *ngIf="toast.visible">
        <div class="toast-pill" [class.toast-error]="toast.isError">
          {{ toast.message }}
        </div>
      </div>

      <!-- Products Tab -->
      <div class="tab-content" *ngIf="activeTab === 'products'">
        <div class="products-header" *ngIf="!showForm">
          <div class="search-box">
            <svg lucidePlus size="20" style="color: #64748b;"></svg>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar productos por nombre o categoría...">
          </div>
          
          <div class="category-tabs">
            <button 
              *ngFor="let cat of categories" 
              class="cat-tab"
              [class.active]="activeCategory === cat"
              (click)="activeCategory = cat">
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="product-grid-admin" *ngIf="!showForm">
          <div class="admin-card" *ngFor="let product of filteredProductsList">
            <div class="admin-card-img">
              <img [src]="product.imageUrl || 'assets/placeholder.png'" [alt]="product.name">
              <div class="card-badges">
                <span class="badge" [class.badge-active]="product.isActive" [class.badge-inactive]="!product.isActive">
                  {{ product.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
            <div class="card-details">
              <h4>{{ product.name }}</h4>
              <p>{{ product.description || 'Sin descripción' }}</p>
              <div class="card-bottom">
                <span class="price-text">$ {{ product.price | number }}</span>
                <div class="card-actions">
                  <button class="btn-circle" (click)="editProduct(product)" title="Editar">
                    <svg lucideSquarePen size="18"></svg>
                  </button>
                  <button class="btn-circle btn-delete" (click)="deleteProduct(product.id)" title="Eliminar">
                    <svg lucideTrash2 size="18"></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="filteredProductsList.length === 0" style="grid-column: 1 / -1; text-align: center; padding: 100px;">
            <p style="font-size: 1.2rem; font-weight: 800; color: #888;">No se encontraron productos.</p>
          </div>
        </div>

        <!-- Product Form -->
        <div class="s-section" *ngIf="showForm">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
            <h3 style="margin: 0;">{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h3>
            <button class="btn-circle" (click)="closeForm()">
              <svg lucideX size="20"></svg>
            </button>
          </div>

          <form (submit)="saveProduct()">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" [(ngModel)]="currentProduct.name" name="name" required placeholder="Ej: Cargador USB-C 20W">
              </div>
              <div class="form-group">
                <label>Precio</label>
                <input type="number" [(ngModel)]="currentProduct.price" name="price" required placeholder="0.00">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Categoría</label>
                <input type="text" [(ngModel)]="currentProduct.category" name="category" placeholder="Ej: Cargadores">
              </div>
              <div class="form-group">
                <label>Visibilidad del Producto</label>
                <button type="button" 
                  class="btn-toggle-large" 
                  [class.active]="currentProduct.isActive"
                  (click)="currentProduct.isActive = !currentProduct.isActive">
                  <svg *ngIf="currentProduct.isActive" lucideEye size="20"></svg>
                  <svg *ngIf="!currentProduct.isActive" lucideEyeOff size="20"></svg>
                  <span>{{ currentProduct.isActive ? 'Producto Visible' : 'Producto Oculto' }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="currentProduct.description" name="description" rows="3" placeholder="Detalles del producto..."></textarea>
            </div>

            <div class="form-group">
              <label>Imagen del Producto</label>
              <div class="logo-upload">
                <div class="logo-preview">
                  <img [src]="currentProduct.imageUrl || 'assets/placeholder.png'" alt="Preview">
                </div>
                <div style="flex: 1; display: flex; gap: 10px;">
                  <input type="text" [(ngModel)]="currentProduct.imageUrl" name="imageUrl" style="flex: 1;" placeholder="URL de la imagen">
                  <label class="btn-action btn-light" style="cursor: pointer;">
                    <svg lucideUpload size="18"></svg> Subir
                    <input type="file" (change)="onProductImageUpload($event)" hidden accept="image/*">
                  </label>
                </div>
              </div>
            </div>

            <!-- Variants & Specs Section (Simplified for now) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px;">
              <div class="style-card" style="padding: 24px; border: 1px solid #eee; border-radius: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <h4 style="margin: 0; font-weight: 900;">Variantes</h4>
                  <button type="button" class="btn-circle" (click)="addVariantGroup()"><svg lucidePlus size="16"></svg></button>
                </div>
                <div *ngFor="let v of currentProduct.variants; let i = index" style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 12px;">
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" [(ngModel)]="v.name" [name]="'vname' + i" placeholder="Nombre (Ej: Color)" style="flex: 1; padding: 8px 12px;">
                    <button type="button" class="btn-circle" style="background: #fee2e2; color: #ef4444;" (click)="removeVariantGroup(i)"><svg lucideTrash2 size="14"></svg></button>
                  </div>
                  <div *ngFor="let opt of v.options; let j = index" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                    <button type="button" 
                      class="btn-toggle-mini" 
                      [class.active]="opt.isAvailable !== false"
                      (click)="opt.isAvailable = opt.isAvailable === false ? true : false"
                      [title]="opt.isAvailable === false ? 'Activar' : 'Desactivar'">
                      <svg *ngIf="opt.isAvailable !== false" lucideCheckCircle size="14"></svg>
                      <svg *ngIf="opt.isAvailable === false" lucideCircleOff size="14"></svg>
                    </button>
                    <input type="text" [(ngModel)]="opt.label" [name]="'opt' + i + j" placeholder="Opción" style="flex: 2; padding: 8px 12px; font-size: 0.85rem; border-radius: 10px;">
                    <input type="number" [(ngModel)]="opt.price" [name]="'optp' + i + j" placeholder="+ Precio" style="flex: 1; padding: 8px 12px; font-size: 0.85rem; border-radius: 10px;">
                    <button type="button" class="btn-circle btn-delete-mini" (click)="removeOption(i, j)"><svg lucideX size="14"></svg></button>
                  </div>
                  <button type="button" (click)="addOption(i)" style="width: 100%; border: 1px dashed #ccc; background: transparent; padding: 5px; border-radius: 8px; font-size: 0.75rem; margin-top: 10px;">+ Opción</button>
                </div>
              </div>

              <div class="style-card" style="padding: 24px; border: 1px solid #eee; border-radius: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <h4 style="margin: 0; font-weight: 900;">Especificaciones</h4>
                  <button type="button" class="btn-circle" (click)="addSpecification()"><svg lucidePlus size="16"></svg></button>
                </div>
                <div *ngFor="let s of currentProduct.specifications; let i = index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <input type="text" [(ngModel)]="s.key" [name]="'skey' + i" placeholder="Clave" style="flex: 1; padding: 8px 12px;">
                  <input type="text" [(ngModel)]="s.value" [name]="'sval' + i" placeholder="Valor" style="flex: 1; padding: 8px 12px;">
                  <button type="button" class="btn-circle" style="background: #fee2e2; color: #ef4444;" (click)="removeSpecification(i)"><svg lucideTrash2 size="14"></svg></button>
                </div>
              </div>
            </div>

            <div style="margin-top: 40px; display: flex; gap: 15px;">
              <button type="button" class="btn-action btn-light" (click)="closeForm()" style="flex: 1;">
                Cancelar
              </button>
              <button type="submit" class="btn-action btn-dark" style="flex: 2;">
                <svg lucideSave size="18"></svg> Guardar Producto
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Settings Tab -->
      <div class="tab-content" *ngIf="activeTab === 'settings'">
        <div class="settings-editor-container" [class.with-preview]="isPreviewActive">
          <div class="settings-layout" *ngIf="settings">
            <div class="settings-sidebar">
              <button class="s-nav-item" [class.active]="activeSettingsSection === 'general'" (click)="activeSettingsSection = 'general'">
                <svg lucideSettings size="18"></svg> Información
              </button>
              <button class="s-nav-item" [class.active]="activeSettingsSection === 'colors'" (click)="activeSettingsSection = 'colors'">
                <svg lucidePalette size="18"></svg> Apariencia
              </button>
              <button class="s-nav-item" [class.active]="activeSettingsSection === 'hero'" (click)="activeSettingsSection = 'hero'">
                <svg lucideImage size="18"></svg> Banners
              </button>
              <button class="s-nav-item" [class.active]="activeSettingsSection === 'social'" (click)="activeSettingsSection = 'social'">
                <svg lucideShare2 size="18"></svg> Redes
              </button>
              <button class="s-nav-item" [class.active]="activeSettingsSection === 'horarios'" (click)="activeSettingsSection = 'horarios'">
                <svg lucideClock size="18"></svg> Horarios
              </button>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                <button class="btn-action btn-dark" style="width: 100%" (click)="saveSettings()">
                  <svg lucideSave size="18"></svg> Guardar Todo
                </button>
              </div>
            </div>

            <div class="settings-main">
              <!-- General Section -->
              <div class="s-section" *ngIf="activeSettingsSection === 'general'">
                <h3>Identidad de la Tienda</h3>
                <div class="form-group">
                  <label>Nombre del Negocio</label>
                  <input type="text" [(ngModel)]="settings.businessName" (input)="updatePreview()" placeholder="Mi Tienda">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>WhatsApp Comercial</label>
                    <input type="text" [(ngModel)]="settings.whatsappNumber" placeholder="573001234567">
                  </div>
                  <div class="form-group">
                    <label>Slug de la Tienda</label>
                    <div class="slug-box">
                      <span>/</span>
                      <input type="text" [(ngModel)]="settings.slug" placeholder="tu-tienda">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Costo de Domicilio ($)</label>
                    <input type="number" [(ngModel)]="settings.deliveryFee" placeholder="Ej: 6000">
                  </div>
                </div>
                <div class="form-group">
                  <label>Sobre Nosotros (Descripción de la tienda)</label>
                  <textarea [(ngModel)]="settings.description" rows="5" placeholder="Escribe aquí la historia o descripción de tu negocio..."></textarea>
                </div>
                <div class="form-group">
                  <label>Dirección Física (Opcional)</label>
                  <input type="text" [(ngModel)]="settings.address" placeholder="Ej: Calle 123 #45-67, Barrio Centro">
                </div>
                <div class="form-group">
                  <label>Mensaje de Bienvenida (Hero)</label>
                  <input type="text" [(ngModel)]="settings.welcomeMessage" (input)="updatePreview()" placeholder="Bienvenidos!">
                </div>
                <div class="form-group">
                  <label>Logo del Negocio</label>
                  <div class="logo-upload">
                    <div class="logo-preview">
                      <img [src]="settings.logoUrl || 'assets/placeholder.png'" alt="Logo">
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                      <input type="text" [(ngModel)]="settings.logoUrl" placeholder="URL del logo">
                      <label class="btn-action btn-light" style="width: fit-content; cursor: pointer;">
                        <svg lucideUpload size="18"></svg> Subir Imagen
                        <input type="file" (change)="onImageUpload($event, 'logo')" hidden accept="image/*">
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Appearance Section -->
              <div class="s-section" *ngIf="activeSettingsSection === 'colors'">
                <h3>Estilo y Colores</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label>Color Principal</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                      <input type="color" [(ngModel)]="settings.primaryColor" (input)="updatePreview()" style="width: 60px; height: 50px; padding: 5px;">
                      <span style="font-weight: 700; font-family: monospace;">{{ settings.primaryColor }}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Fondo de Página</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                      <input type="color" [(ngModel)]="settings.backgroundColor" (input)="updatePreview()" style="width: 60px; height: 50px; padding: 5px;">
                      <span style="font-weight: 700; font-family: monospace;">{{ settings.backgroundColor }}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                      <label>Tipografía del Sitio</label>
                      <select [(ngModel)]="settings.fontFamily" (change)="updatePreview()">
                        <option *ngFor="let font of fontOptions" [value]="font.value">{{ font.name }}</option>
                      </select>
                </div>
                <div class="form-group">
                  <label>Estilo de Barra de Navegación</label>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <button class="btn-action btn-light" [class.btn-dark]="settings.navbarStyle === 'glass'" (click)="settings.navbarStyle = 'glass'; updatePreview()">Cristal</button>
                    <button class="btn-action btn-light" [class.btn-dark]="settings.navbarStyle === 'solid'" (click)="settings.navbarStyle = 'solid'; updatePreview()">Sólido</button>
                    <button class="btn-action btn-light" [class.btn-dark]="settings.navbarStyle === 'minimal'" (click)="settings.navbarStyle = 'minimal'; updatePreview()">Mínimo</button>
                  </div>
                </div>
              </div>

              <div class="s-section" *ngIf="activeSettingsSection === 'hero'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                  <div>
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                      Banners Publicitarios
                      <span style="font-size: 0.65rem; background: #eef2ff; color: #6366f1; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid #e0e7ff; text-transform: uppercase; letter-spacing: 0.5px;">
                        1920 x 800 px
                      </span>
                    </h3>
                    <p style="color: #64748b; font-size: 0.85rem; margin-top: 6px; margin-bottom: 0;">Gestiona las imágenes que aparecen en la portada de tu tienda.</p>
                  </div>
                  <button class="btn-action btn-dark" (click)="addSlide()" style="padding: 12px 20px; gap: 10px; height: 48px;">
                    <svg lucidePlus size="20"></svg> Añadir Nuevo Banner
                  </button>
                </div>

                <div class="banner-card" *ngFor="let slide of settings.heroSlides; let i = index">
                  <div class="banner-preview-box">
                    <img [src]="slide.url || 'assets/placeholder.png'" alt="Slide Preview">
                  </div>

                  <div class="banner-info-fields">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label style="font-size: 0.7rem;">URL de la Imagen</label>
                      <input type="text" [(ngModel)]="slide.url" (input)="updatePreview()" placeholder="Pega el enlace de la imagen aquí">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label style="font-size: 0.7rem;">Título del Banner (Opcional)</label>
                      <input type="text" [(ngModel)]="slide.title" (input)="updatePreview()" placeholder="Ej: Ofertas de Verano">
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 12px;">
                      <label class="btn-action btn-light" style="flex: 1; justify-content: center; cursor: pointer; margin: 0;">
                        <svg lucideUpload size="16"></svg> Cambiar Imagen
                        <input type="file" (change)="onSlideImageUpload($event, i)" hidden accept="image/*">
                      </label>
                      <button class="btn-action btn-danger" style="flex: 1; justify-content: center;" (click)="removeSlide(i)">
                        <svg lucideTrash2 size="16"></svg> Eliminar Banner
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="!settings.heroSlides || settings.heroSlides.length === 0" style="text-align: center; padding: 40px; border: 2px dashed var(--border); border-radius: 20px;">
                  <p style="color: #64748b; font-weight: 700;">No tienes banners configurados. ¡Añade uno para destacar tus productos!</p>
                </div>
              </div>

              <!-- Social Section -->
              <div class="s-section" *ngIf="activeSettingsSection === 'social'">
                <h3>Redes Sociales</h3>
                <div *ngIf="settings.socialLinks">
                  <div class="form-group">
                    <label>Instagram (@usuario)</label>
                    <input type="text" [(ngModel)]="settings.socialLinks.instagram" placeholder="mi.tienda">
                  </div>
                  <div class="form-group">
                    <label>Facebook (usuario o link)</label>
                    <input type="text" [(ngModel)]="settings.socialLinks.facebook" placeholder="mi.tienda">
                  </div>
                  <div class="form-group">
                    <label>Twitter / X (@usuario)</label>
                    <input type="text" [(ngModel)]="settings.socialLinks.twitter" placeholder="mi.tienda">
                  </div>
                  <div class="form-group">
                    <label>TikTok (@usuario)</label>
                    <input type="text" [(ngModel)]="settings.socialLinks.tiktok" placeholder="mi.tienda">
                  </div>
                  <div class="form-group">
                    <label>Facebook (Link o Usuario)</label>
                    <input type="text" [(ngModel)]="settings.socialLinks.facebook" placeholder="mi.tienda">
                  </div>
                </div>
              </div>

              <!-- Business Hours Section -->
              <div class="s-section" *ngIf="activeSettingsSection === 'horarios'">
                <div style="margin-bottom: 30px;">
                  <h3 style="margin: 0;">Horario Laboral</h3>
                  <p style="color: #64748b; font-size: 0.85rem; margin-top: 6px;">Configura los días y horas en los que tu tienda está abierta al público.</p>
                </div>

                <div class="hours-grid">
                  <div *ngFor="let day of settings.businessHours; let i = index" class="day-row" [class.day-disabled]="!day.enabled">
                    <div class="day-info">
                      <button type="button" 
                        class="btn-toggle-mini" 
                        [class.active]="day.enabled"
                        (click)="day.enabled = !day.enabled">
                        <svg *ngIf="day.enabled" lucideCheckCircle size="14"></svg>
                        <svg *ngIf="!day.enabled" lucideCircleOff size="14"></svg>
                      </button>
                      <span class="day-name">{{ day.day }}</span>
                    </div>
                    
                    <div class="time-inputs" *ngIf="day.enabled">
                      <div class="time-group">
                        <label>Abre</label>
                        <input type="time" [(ngModel)]="day.open" class="time-field">
                      </div>
                      <div class="time-separator">a</div>
                      <div class="time-group">
                        <label>Cierra</label>
                        <input type="time" [(ngModel)]="day.close" class="time-field">
                      </div>
                    </div>
                    
                    <div class="day-status-text" *ngIf="!day.enabled">
                      Cerrado todo el día
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Preview Panel -->
          <div class="live-preview-panel" *ngIf="isPreviewActive">
            <div class="preview-frame">
              <div class="preview-header">
                <div style="display: flex; gap: 6px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56;"></span>
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e;"></span>
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #27c93f;"></span>
                </div>
                <span style="color: #64748b; font-size: 0.75rem; font-weight: 800;">Vista Previa Real</span>
              </div>
              <div class="preview-content-scroller" [style.font-family]="settings.fontFamily" [style.background]="'#f0f2f5'">
                <!-- Mockup Storefront -->
                <div [style.background]="settings.navbarStyle === 'solid' ? settings.primaryColor : 'rgba(255,255,255,0.9)'" 
                     style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px);">
                  <span style="font-weight: 900; font-size: 0.8rem;" [style.color]="settings.navbarStyle === 'solid' ? '#fff' : '#000'">{{ settings.businessName }}</span>
                  <div style="width: 20px; height: 20px; border-radius: 50%;" [style.background]="settings.primaryColor"></div>
                </div>

                <div style="width: 100%; height: 180px; position: relative; overflow: hidden; background: #000;">
                  <img [src]="settings.heroSlides?.[0]?.url || 'assets/placeholder.png'" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.7;">
                  <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 20px; color: white;">
                    <h2 style="font-size: 1.2rem; margin: 0; line-height: 1.2;">{{ settings.heroSlides?.[0]?.title || settings.businessName }}</h2>
                    <button [style.background]="settings.primaryColor" style="border: none; padding: 8px 16px; border-radius: 50px; color: white; margin-top: 10px; align-self: flex-start; font-size: 0.6rem; font-weight: 900; text-transform: uppercase;">Explorar</button>
                  </div>
                </div>

                <div style="padding: 20px;" [style.background]="settings.backgroundColor || '#f0f2f5'">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; font-size: 0.9rem; font-weight: 900;">Productos</h4>
                    <div style="font-size: 0.6rem; color: #888;">{{activeCategory}}</div>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div *ngFor="let i of [1,2]" style="background: white; border-radius: 18px; border: 1px solid rgba(0,0,0,0.03); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                      <div style="height: 90px; background: #fff; display: flex; align-items: center; justify-content: center;">
                         <div style="width: 50px; height: 50px; background: #f8fafc; border-radius: 10px;"></div>
                      </div>
                      <div style="padding: 10px;">
                        <div style="font-size: 0.65rem; font-weight: 800; margin-bottom: 4px;">Producto Ejemplo {{i}}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-weight: 950; font-size: 0.8rem;">$ 99.900</span>
                          <span [style.background]="settings.primaryColor" style="width: 24px; height: 24px; border-radius: 8px; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 900;">+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Master Tab -->
      <div class="tab-content" *ngIf="activeTab === 'master' && isSuperAdmin">
        <div class="s-section">
          <h3>Panel Global</h3>
          <div class="stat-row">
            <div class="stat-card">
              <span class="stat-label">Total de Tiendas</span>
              <span class="stat-value">{{ masterStores.length }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Estado</span>
              <span class="stat-value" style="color: #22c55e;">ONLINE</span>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="master-table">
              <thead>
                <tr>
                  <th>Tienda</th>
                  <th>Slug</th>
                  <th>Dueño</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let store of masterStores">
                  <td>{{ store.name }}</td>
                  <td>/{{ store.slug }}</td>
                  <td>{{ store.ownerEmail }}</td>
                  <td>
                    <button class="btn-action btn-light" style="padding: 6px 12px; font-size: 0.8rem;" (click)="viewStore(store.slug)">Visitar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0f172a;
      --accent: var(--primary-color, #6366f1);
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --radius-lg: 24px;
      --radius-md: 16px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 10px 25px -5px rgba(0,0,0,0.05);
      --shadow-lg: 0 20px 50px -12px rgba(0,0,0,0.1);
      font-family: 'Outfit', sans-serif;
    }

    .admin-container { 
      min-height: 100vh; 
      background: var(--bg); 
      padding: 40px 20px;
      color: var(--primary);
    }

    /* Header */
    .admin-header {
      background: white;
      padding: 32px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border);
      margin-bottom: 40px;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-info h2 {
      font-size: 2.2rem;
      font-weight: 900;
      letter-spacing: -1.5px;
      margin: 0;
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-action {
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid transparent;
    }

    .btn-dark {
      background: var(--primary);
      color: white;
    }

    .btn-dark:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
      filter: brightness(1.2);
    }

    .btn-light {
      background: white;
      border-color: var(--border);
      color: #64748b;
    }

    .btn-light:hover {
      background: #f1f5f9;
      color: var(--primary);
    }

    /* Toggle Buttons */
    .btn-toggle-large {
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      border: 2px solid var(--border);
      background: white;
      color: #64748b;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-toggle-large.active {
      border-color: #22c55e;
      background: #f0fdf4;
      color: #166534;
    }
    .btn-toggle-large:not(.active) {
      border-color: #ef4444;
      background: #fef2f2;
      color: #991b1b;
    }

    .btn-toggle-mini {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #f8fafc;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-toggle-mini.active {
      background: #dcfce7;
      color: #22c55e;
      border-color: #bbf7d0;
    }
    .btn-toggle-mini:not(.active) {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fecaca;
    }

    .btn-delete-mini {
      width: 32px;
      height: 32px;
      background: transparent !important;
      color: #94a3b8 !important;
      border: none !important;
    }
    .btn-delete-mini:hover { color: #ef4444 !important; }

    /* Tabs */
    .tabs-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }

    .tabs {
      display: flex;
      gap: 6px;
      background: #f1f5f9;
      padding: 6px;
      border-radius: 18px;
    }

    .tab-btn {
      padding: 10px 20px !important;
      min-height: unset !important;
      border-radius: 14px;
      border: none;
      background: transparent;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: white;
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .preview-toggle {
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 10px 20px !important;
      min-height: unset !important;
      border-radius: 14px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: 0.2s;
    }

    .preview-toggle.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    /* Products Tab */
    .products-header {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 16px 24px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: 0.3s;
    }

    .search-box:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .search-box input {
      border: none;
      outline: none;
      font-size: 1rem;
      font-weight: 600;
      width: 100%;
      color: var(--primary);
    }

    .category-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: none;
    }

    .cat-tab {
      padding: 8px 18px;
      border-radius: 100px;
      background: white;
      border: 1px solid var(--border);
      color: #64748b;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: 0.2s;
    }

    .cat-tab.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .product-grid-admin {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .admin-card {
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
    }

    .admin-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
      border-color: var(--accent);
    }

    .admin-card-img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .card-badges {
      position: absolute;
      top: 16px;
      right: 16px;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    .badge-inactive { background: #fee2e2; color: #991b1b; }

    .card-details { padding: 24px; }
    .card-details h4 { font-size: 1.1rem; font-weight: 800; margin: 0 0 8px; color: var(--primary); }
    .card-details p { font-size: 0.875rem; color: #64748b; margin-bottom: 20px; line-height: 1.5; height: 3rem; overflow: hidden; }

    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }

    .price-text { font-size: 1.25rem; font-weight: 900; color: var(--primary); }

    .card-actions { display: flex; gap: 8px; }
    .btn-circle {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: white;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.2s;
      padding: 0 !important;
      min-height: unset !important;
      overflow: visible;
    }
    .btn-circle svg { display: block; flex-shrink: 0; }

    .btn-circle:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: scale(1.1);
    }

    .btn-delete:hover { background: #ef4444 !important; border-color: #ef4444 !important; }
    
    .btn-danger {
      background: #fee2e2;
      color: #ef4444;
      border: 1px solid #fecaca;
    }

    .btn-danger:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }

    .btn-add-banner {
      background: var(--primary);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 16px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }

    .btn-add-banner:hover {
      transform: rotate(90deg) scale(1.1);
      background: var(--accent);
    }

    .banner-card {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      gap: 24px;
      position: relative;
      transition: 0.3s;
    }

    .banner-card:hover {
      border-color: var(--accent);
      background: white;
      box-shadow: var(--shadow-md);
    }

    .banner-preview-box {
      width: 200px;
      height: 120px;
      border-radius: 14px;
      overflow: hidden;
      background: white;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .banner-preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .banner-info-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-remove-banner {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #fee2e2;
      color: #ef4444;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.2s;
      opacity: 0.6;
    }

    .banner-card:hover .btn-remove-banner {
      opacity: 1;
    }

    .btn-remove-banner:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    /* Settings Tab */
    .settings-editor-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      align-items: start;
    }

    .settings-editor-container.with-preview {
      grid-template-columns: 1fr 400px;
    }

    .settings-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 32px;
    }

    .settings-sidebar {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: white;
      padding: 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 40px;
    }

    .s-nav-item {
      padding: 14px 20px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: #64748b;
      font-weight: 700;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
    }

    .s-nav-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .s-nav-item:hover { 
      background: #f1f5f9; 
      color: var(--primary); 
    }
    
    .s-nav-item.active { 
      background: var(--primary); 
      color: white; 
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
    }

    .s-section {
      background: white;
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
    }

    .s-section h3 {
      font-size: 1.75rem;
      font-weight: 900;
      letter-spacing: -1px;
      margin-bottom: 32px;
      color: var(--primary);
    }

    /* Form Elements */
    .form-group { margin-bottom: 24px; }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 800;
      color: #64748b;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input, 
    .form-group textarea, 
    .form-group select {
      width: 100%;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: #f8fafc;
      font-size: 1rem;
      font-weight: 600;
      color: var(--primary);
      transition: 0.3s;
    }

    .form-group input:focus, 
    .form-group textarea:focus {
      border-color: var(--accent);
      background: white;
      outline: none;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .slug-box {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 14px;
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .slug-box span {
      padding: 0 16px;
      color: #64748b;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .slug-box input {
      border: none;
      background: white;
      border-radius: 0;
    }

    .logo-upload {
      display: flex;
      gap: 24px;
      align-items: center;
      background: #f8fafc;
      padding: 20px;
      border-radius: var(--radius-md);
      border: 2px dashed var(--border);
    }

    .logo-preview {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      box-shadow: var(--shadow-sm);
    }

    .logo-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }

    /* Live Preview Panel */
    .live-preview-panel {
      position: sticky;
      top: 40px;
      width: 400px;
    }

    .preview-frame {
      background: white;
      border-radius: 40px;
      border: 12px solid #0f172a;
      height: 700px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
    }

    .preview-header {
      background: #0f172a;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .preview-content-scroller {
      flex: 1;
      overflow-y: auto;
      background: #fff;
    }

    /* Master Table */
    .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .stat-card {
      background: white;
      padding: 32px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .stat-label { font-size: 0.875rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
    .stat-value { font-size: 2.5rem; font-weight: 900; color: var(--primary); margin-top: 8px; display: block; }

    .table-wrapper {
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .master-table { width: 100%; border-collapse: collapse; }
    .master-table th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 0.8rem; font-weight: 800; color: #64748b; }
    .master-table td { padding: 16px 24px; border-top: 1px solid #f1f5f9; font-weight: 600; color: #334155; }

    /* Integrated Toast Banner */
    .toast-wrapper {
      display: flex;
      justify-content: center;
      margin-top: -10px;
      margin-bottom: 30px;
      width: 100%;
      z-index: 2000;
      animation: toastSlideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-pill {
      background: #0f172a;
      color: white;
      padding: 14px 45px;
      border-radius: 100px;
      font-weight: 750;
      box-shadow: 0 12px 30px rgba(0,0,0,0.15);
      font-size: 1rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .toast-error {
      background: #ef4444;
      box-shadow: 0 12px 30px rgba(239, 68, 68, 0.2);
    }
    @keyframes toastSlideDown {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 1024px) {
      .settings-editor-container.with-preview { grid-template-columns: 1fr; }
      .live-preview-panel { display: none; }
      .settings-layout { grid-template-columns: 1fr; }
    }

    /* Business Hours Styles */
    .hours-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .day-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: #f8fafc;
      border-radius: 16px;
      border: 1px solid var(--border);
      transition: 0.3s;
    }
    .day-row:hover {
      border-color: var(--accent);
      background: white;
    }
    .day-disabled {
      opacity: 0.6;
      background: #f1f5f9;
    }
    .day-info {
      display: flex;
      align-items: center;
      gap: 15px;
      min-width: 140px;
    }
    .day-name {
      font-weight: 800;
      font-size: 1rem;
    }
    .time-inputs {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .time-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .time-group label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .time-field {
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      font-weight: 700;
      font-size: 0.9rem;
      outline: none;
      background: white;
    }
    .time-field:focus {
      border-color: var(--accent);
    }
    .time-separator {
      margin-top: 18px;
      font-weight: 800;
      color: #94a3b8;
      font-size: 0.8rem;
    }
    .day-status-text {
      color: #64748b;
      font-weight: 700;
      font-size: 0.9rem;
      font-style: italic;
    }
    /* Loading State */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(248, 250, 252, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #e2e8f0;
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: 'products' | 'settings' | 'master' = 'products';
  products: Product[] = [];
  searchTerm = '';
  categories: string[] = ['Todos'];
  activeCategory = 'Todos';
  isCategoryMenuOpen = false;
  categorySearchTerm = '';

  get filteredCategories() {
    if (!this.categorySearchTerm) return this.categories;
    const term = this.categorySearchTerm.toLowerCase();
    return this.categories.filter(c => c.toLowerCase().includes(term));
  }
  settings: Settings | null = null;
  masterStores: any[] = [];
  isSuperAdmin = false;
  private adminEmails = ['juanse1030@gmail.com', 'uparshopelectronics@gmail.com'];
  toast = { visible: false, message: '', isError: false };
  private toastTimer: any;
  private _subs = new Subscription();
  fontOptions = [
    { name: 'Inter (Moderna)', value: "'Inter', sans-serif" },
    { name: 'Montserrat (Geométrica)', value: "'Montserrat', sans-serif" },
    { name: 'Outfit (Premium)', value: "'Outfit', sans-serif" },
    { name: 'Poppins (Minimalista)', value: "'Poppins', sans-serif" },
    { name: 'Playfair Display (Clásica)', value: "'Playfair Display', serif" },
    { name: 'Dancing Script (Cursiva)', value: "'Dancing Script', cursive" },
    { name: 'Satisfy (Artística)', value: "'Satisfy', cursive" }
  ];

  get filteredProductsList() {
    let filtered = this.products;
    
    // Filter by Category
    if (this.activeCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }

    // Filter by Search Term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.category && p.category.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }
  activeSettingsSection: 'general' | 'colors' | 'hero' | 'social' | 'horarios' = 'general';
  isLoading = true;
  isPreviewActive = true;
  showForm = false;
  editingProduct: Product | null = null;
  currentProduct: Partial<Product> = { name: '', price: 0, description: '', imageUrl: '', category: '', variants: [], specifications: [] };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private isLoaded = false;

  ngOnInit() {
    this._subs.add(this.authService.currentSession$.subscribe(session => {
      if (session && !this.isLoaded) {
        this.isLoaded = true;
        this.checkSuperAdmin(session.user?.email);
        this.loadProducts();
        this.loadSettings();
        if (this.isSuperAdmin) {
          this.loadMasterData();
        }
      } else if (!session) {
        this.isLoading = false;
      }
    }));
  }

  ngOnDestroy() {
    this._subs.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  checkSuperAdmin(email?: string) {
    this.isSuperAdmin = !!email && this.adminEmails.includes(email);
  }

  private showToast(message: string, isError = false) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, isError };
    this.toastTimer = setTimeout(() => this.toast.visible = false, 3000);
  }

  loadMasterData() {
    this.dataService.getMasterStores().subscribe({
      next: (data) => this.masterStores = data,
      error: () => this.showToast('Error cargando datos de tiendas', true)
    });
  }

  loadProducts() {
    this.dataService.getMyProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.extractCategories();
      },
      error: () => this.showToast('Error cargando productos', true)
    });
  }

  extractCategories() {
    const cats = this.products.map(p => p.category).filter(c => c && c.trim() !== '') as string[];
    const uniqueCats = [...new Set(cats)];
    this.categories = ['Todos', ...uniqueCats];
    
    // If active category no longer exists, reset to Todos
    if (this.activeCategory !== 'Todos' && !this.categories.includes(this.activeCategory)) {
      this.activeCategory = 'Todos';
    }
  }

  loadSettings() {
    this.dataService.getMySettings().subscribe({
      next: (data) => {
        this.settings = data;
        if (!this.settings.socialLinks) {
          this.settings.socialLinks = { instagram: '', facebook: '', tiktok: '' };
        }
        if (!this.settings.fontFamily) {
          this.settings.fontFamily = "'Inter', sans-serif";
        }
        if (!this.settings.navbarStyle) {
          this.settings.navbarStyle = 'glass';
        }
        if (!this.settings.businessHours || this.settings.businessHours.length === 0) {
          this.settings.businessHours = [
            { day: 'Lunes', open: '08:00', close: '18:00', enabled: true },
            { day: 'Martes', open: '08:00', close: '18:00', enabled: true },
            { day: 'Miércoles', open: '08:00', close: '18:00', enabled: true },
            { day: 'Jueves', open: '08:00', close: '18:00', enabled: true },
            { day: 'Viernes', open: '08:00', close: '18:00', enabled: true },
            { day: 'Sábado', open: '08:00', close: '13:00', enabled: true },
            { day: 'Domingo', open: '08:00', close: '13:00', enabled: false },
          ];
        }
        this.updatePreview();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('Error cargando configuración', true);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.editingProduct = null;
    this.currentProduct = { name: '', price: 0, description: '', imageUrl: '', category: '', variants: [], specifications: [] };
    this.showForm = true;
    this.scrollToTop();
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.currentProduct = JSON.parse(JSON.stringify(product));
    this.showForm = true;
    this.scrollToTop();
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
  }

  saveProduct() {
    const payload: any = {
      name: this.currentProduct.name,
      price: this.currentProduct.price,
      description: this.currentProduct.description || '',
      imageUrl: this.currentProduct.imageUrl || '',
      category: this.currentProduct.category || 'Otros',
      isActive: this.currentProduct.isActive !== false,
      variants: this.currentProduct.variants || [],
      specifications: this.currentProduct.specifications || []
    };

    if (this.editingProduct) {
      this.dataService.updateProduct(this.editingProduct.id, payload).subscribe({
        next: () => { 
          this.showToast('Producto actualizado'); 
          this.loadProducts(); 
          this.closeForm(); 
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.showToast('Error al actualizar el producto', true);
        }
      });
    } else {
      this.dataService.createProduct(payload).subscribe({
        next: () => { 
          this.showToast('Producto creado'); 
          this.loadProducts(); 
          this.closeForm(); 
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.showToast('Error al crear el producto', true);
        }
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.dataService.deleteProduct(id).subscribe({
        next: () => { this.showToast('Producto eliminado'); this.loadProducts(); },
        error: () => this.showToast('Error al eliminar el producto', true)
      });
    }
  }

  updatePreview() {
    if (this.settings) {
      // Global root variables for general UI
      document.documentElement.style.setProperty('--primary-color', this.settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', this.settings.secondaryColor || this.settings.primaryColor);
      document.documentElement.style.setProperty('--accent-color', this.settings.accentColor || '#6366f1');
      
      if (this.settings.fontFamily) {
        document.documentElement.style.setProperty('--font-family', this.settings.fontFamily);
      }
    }
  }

  saveSettings() {
    if (this.settings) {
      // Validar slug
      if (!this.settings.slug || this.settings.slug.trim() === '') {
        this.showToast('El slug de la tienda es obligatorio', true);
        return;
      }
      // Slugify: lowercase, remove accents, remove non-alphanumeric

      const payload: any = {};
      const fields = [
        'businessName', 'logoUrl', 'primaryColor', 'secondaryColor', 
        'accentColor', 'backgroundColor', 'whatsappNumber', 'welcomeMessage', 
        'slug', 'description', 'heroSlides', 'fontFamily', 
        'navbarStyle', 'cardStyle', 'socialLinks', 'deliveryFee', 'businessHours', 'address'
      ];

      fields.forEach(field => {
        if (this.settings![field as keyof Settings] !== undefined) {
          payload[field] = this.settings![field as keyof Settings];
        }
      });

      this.dataService.updateSettings(payload).subscribe({
        next: (s) => { 
          this.settings = s; 
          this.updatePreview(); 
          this.showToast('Configuración guardada con éxito'); 
        },
        error: (err) => {
          console.error('Error saving settings:', err);
          const errorMsg = err.error?.message || 'Error al guardar la configuración';
          this.showToast(errorMsg, true);
        }
      });
    }
  }

  // Hero Slides Management
  addSlide() {
    if (!this.settings) return;
    if (!this.settings.heroSlides) this.settings.heroSlides = [];
    this.settings.heroSlides.push({ url: '', title: '', subtitle: '' });
  }

  removeSlide(index: number) {
    if (!this.settings?.heroSlides) return;
    this.settings.heroSlides.splice(index, 1);
  }

  onSlideImageUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (file && this.settings?.heroSlides) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => {
          this.settings!.heroSlides![index].url = res.url;
          this.showToast('Imagen del slide subida');
        },
        error: () => this.showToast('Error al subir la imagen del slide', true)
      });
    }
  }

  onImageUpload(event: any, type: 'logo' | 'background' = 'logo') {
    const file = event.target.files[0];
    if (file && this.settings) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => {
          if (type === 'logo') this.settings!.logoUrl = res.url;
          else this.settings!.backgroundImageUrl = res.url;
          this.showToast('Imagen subida');
        },
        error: () => this.showToast('Error al subir la imagen', true)
      });
    }
  }

  onProductImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => { this.currentProduct.imageUrl = res.url; this.showToast('Imagen del producto subida'); },
        error: () => this.showToast('Error al subir la imagen del producto y variante', true)
      });
    }
  }

  // Variants Management
  addVariantGroup() {
    if (!this.currentProduct.variants) this.currentProduct.variants = [];
    this.currentProduct.variants.push({ name: '', options: [{ label: '', price: 0 }] });
  }

  removeVariantGroup(index: number) {
    this.currentProduct.variants?.splice(index, 1);
  }

  addOption(variantIndex: number) {
    this.currentProduct.variants![variantIndex].options.push({ label: '', price: 0 });
  }

  onOptionImageUpload(event: any, vIdx: number, oIdx: number) {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => { this.currentProduct.variants![vIdx].options[oIdx].imageUrl = res.url; this.showToast('Imagen de variante subida'); },
        error: () => this.showToast('Error al subir imagen de variante', true)
      });
    }
  }

  removeOption(variantIndex: number, optionIndex: number) {
    this.currentProduct.variants![variantIndex].options.splice(optionIndex, 1);
  }

  addSpecification() {
    if (!this.currentProduct.specifications) this.currentProduct.specifications = [];
    this.currentProduct.specifications.push({ key: '', value: '' });
  }

  removeSpecification(index: number) {
    this.currentProduct.specifications?.splice(index, 1);
  }

  goBack() {
    if (this.settings?.slug) {
      this.router.navigate(['/', this.settings.slug]);
    } else {
      window.history.back();
    }
  }

  goToMyStore() {
    if (this.settings?.slug) {
      window.open(environment.storeUrl + '/' + this.settings.slug, '_blank');
    } else {
      this.showToast('Configura el slug de tu tienda primero', true);
    }
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      this.showToast('Error al cerrar sesión', true);
    }
  }

  viewStore(slug: string) {
    window.open(environment.storeUrl + '/' + slug, '_blank');
  }
}
