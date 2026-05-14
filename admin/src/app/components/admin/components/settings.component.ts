import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Product } from '@shared/models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-editor-container" [class.with-preview]="isPreviewActive">
      <div class="settings-layout" *ngIf="settings">
        <div class="settings-sidebar">
          <button class="s-nav-item" [class.active]="activeSection === 'general'" (click)="activeSection = 'general'">
            <i class="fas fa-info-circle"></i> Información
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'colors'" (click)="activeSection = 'colors'">
            <i class="fas fa-palette"></i> Apariencia
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'hero'" (click)="activeSection = 'hero'">
            <i class="fas fa-images"></i> Banners
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'social'" (click)="activeSection = 'social'">
            <i class="fas fa-share-alt"></i> Redes
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'horarios'" (click)="activeSection = 'horarios'">
            <i class="fas fa-clock"></i> Horarios
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'security'" (click)="activeSection = 'security'">
            <i class="fas fa-lock"></i> Seguridad
          </button>
          <div style="margin-top: 10px; padding-top: 20px; border-top: 1px solid #f1f5f9; grid-column: 1 / -1;">
            <button class="btn-action btn-dark" style="width: 100%; justify-content: center;" (click)="save.emit()">
              <i class="fas fa-save" style="margin-right: 10px;"></i> Guardar Todo
            </button>
          </div>
        </div>

        <div class="settings-main">
          <!-- General Section -->
          <div class="s-section" *ngIf="activeSection === 'general'">
            <div class="section-header">
              <h3>Identidad de la Tienda</h3>
              <p>Configura los detalles básicos que verán tus clientes.</p>
            </div>
            
            <div class="form-group">
              <label>Nombre del Negocio</label>
              <input type="text" [(ngModel)]="settings.businessName" (input)="updatePreview.emit()" placeholder="Mi Tienda">
            </div>

            <div class="form-grid-3">
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
              <div class="form-group" [style.opacity]="settings.hasDelivery ? 1 : 0.5">
                <label>Costo de Domicilio ($)</label>
                <input type="number" [(ngModel)]="settings.deliveryFee" [disabled]="!settings.hasDelivery" placeholder="Ej: 6000">
              </div>
            </div>

            <div class="form-grid-2" style="margin-top: 10px; padding: 20px; background: #f8fafc; border-radius: 18px; border: 1px dashed #cbd5e1;">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                  <i class="fas fa-truck" [style.color]="settings.hasDelivery ? '#0f172a' : '#94a3b8'"></i>
                  Servicio de Domicilio
                </label>
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div class="ios-toggle" [class.active]="settings.hasDelivery" (click)="toggleDelivery()">
                    <div class="toggle-handle"></div>
                  </div>
                  <span style="font-weight: 800; font-size: 0.85rem; color: #475569;">{{ settings.hasDelivery ? 'ACTIVO' : 'INACTIVO' }}</span>
                </div>
              </div>
              
              <div class="form-group" style="margin-bottom: 0;">
                <label style="display: flex; align-items: center; gap: 10px;">
                  <i class="fas fa-hand-holding-usd" [style.color]="settings.allowCashOnDelivery ? '#059669' : '#94a3b8'"></i>
                  Pago Contraentrega
                </label>
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div class="ios-toggle" [class.active]="settings.allowCashOnDelivery" 
                       (click)="settings.allowCashOnDelivery = !settings.allowCashOnDelivery">
                    <div class="toggle-handle"></div>
                  </div>
                  <span style="font-weight: 800; font-size: 0.85rem; color: #475569;">{{ settings.allowCashOnDelivery ? 'HABILITADO' : 'DESHABILITADO' }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Sobre Nosotros (Descripción)</label>
              <textarea [(ngModel)]="settings.description" rows="4" placeholder="Escribe aquí la historia o descripción de tu negocio..."></textarea>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>NIT / Identificación Tributaria</label>
                <input type="text" [(ngModel)]="settings.nit" placeholder="Ej: 900.123.456-1">
              </div>
              <div class="form-group">
                <label>Dirección Física (Opcional)</label>
                <input type="text" [(ngModel)]="settings.address" placeholder="Ej: Calle 123 #45-67, Barrio Centro">
              </div>
            </div>

            <div class="form-group">
              <label>Términos de Garantía y Devoluciones</label>
              <textarea [(ngModel)]="settings.guaranteeTerms" rows="3" placeholder="Ej: La garantía es de 30 días por defectos de fábrica..."></textarea>
            </div>

            <div class="form-group">
              <label class="label-with-hint">
                Logo del Negocio
                <span>Recomendado: 500x500px</span>
              </label>
              <div class="logo-upload-card">
                <div class="logo-preview-container">
                  <img [src]="settings.logoUrl || '/assets/logo-uparmall.png'" 
                       (error)="$event.target.src = '/assets/logo-uparmall.png'"
                       alt="Logo">
                </div>
                <div class="logo-controls">
                  <div class="url-input-wrapper">
                    <i class="fas fa-link"></i>
                    <input type="text" [(ngModel)]="settings.logoUrl" placeholder="URL del logo">
                  </div>
                  <label class="btn-action btn-upload">
                    <i class="fas fa-camera"></i> Subir Imagen
                    <input type="file" (change)="uploadLogo.emit($event)" hidden accept="image/*">
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Appearance Section -->
          <div class="s-section" *ngIf="activeSection === 'colors'">
            <div class="section-header">
              <h3>Estilo y Colores</h3>
              <p>Personaliza los colores y tipografías para que coincidan con tu marca.</p>
            </div>
            
            <div class="form-grid-2">
              <div class="form-group color-group">
                <label>Color Principal</label>
                <div class="color-picker-wrapper">
                  <input type="color" [(ngModel)]="settings.primaryColor" (input)="updatePreview.emit()">
                  <span class="color-code">{{ settings.primaryColor }}</span>
                </div>
              </div>
              <div class="form-group color-group">
                <label>Fondo de Página</label>
                <div class="color-picker-wrapper">
                  <input type="color" [(ngModel)]="settings.backgroundColor" (input)="updatePreview.emit()">
                  <span class="color-code">{{ settings.backgroundColor }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Tipografía del Sitio</label>
              <div class="select-wrapper">
                <select [(ngModel)]="settings.fontFamily" (change)="updatePreview.emit()">
                  <option *ngFor="let font of fontOptions" [value]="font.value">{{ font.name }}</option>
                </select>
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <div class="form-group">
              <label>Estilo de Barra de Navegación</label>
              <div class="style-selector">
                <button class="style-btn" [class.active]="settings.navbarStyle === 'glass'" (click)="settings.navbarStyle = 'glass'; updatePreview.emit()">
                  <div class="style-icon glass"></div>
                  <span>Cristal</span>
                </button>
                <button class="style-btn" [class.active]="settings.navbarStyle === 'solid'" (click)="settings.navbarStyle = 'solid'; updatePreview.emit()">
                  <div class="style-icon solid"></div>
                  <span>Sólido</span>
                </button>
                <button class="style-btn" [class.active]="settings.navbarStyle === 'minimal'" (click)="settings.navbarStyle = 'minimal'; updatePreview.emit()">
                  <div class="style-icon minimal"></div>
                  <span>Mínimo</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Hero Section -->
          <div class="s-section" *ngIf="activeSection === 'hero'">
            <div class="section-header flex-header">
              <div>
                <h3>Banners Publicitarios</h3>
                <p>Imágenes que aparecerán en la parte superior de tu tienda. <b>Recomendado: 1920x500px (Relación 4:1)</b></p>
              </div>
              <button class="btn-action btn-dark" (click)="addSlide.emit()">
                <i class="fas fa-plus"></i> Nuevo Banner
              </button>
            </div>

            <div class="banners-list">
              <div class="banner-card" *ngFor="let slide of settings.heroSlides; let i = index">
                <div class="banner-preview">
                  <img [src]="slide.url || '/assets/logo-uparmall.png'" 
                       (error)="$event.target.src = '/assets/logo-uparmall.png'"
                       alt="Slide Preview">
                  <div class="banner-overlay">
                    <button class="btn-icon-delete" (click)="removeSlide.emit(i)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div class="banner-details">
                  <div class="form-group">
                    <label>Enlace de la Imagen</label>
                    <div class="url-input-wrapper">
                      <i class="fas fa-link"></i>
                      <input type="text" [(ngModel)]="slide.url" (input)="updatePreview.emit()" placeholder="URL de la imagen...">
                    </div>
                  </div>
                  <div class="banner-actions">
                    <label class="btn-action btn-light-full">
                      <i class="fas fa-camera"></i> Cambiar Imagen
                      <input type="file" (change)="uploadSlide.emit({event: $event, index: i})" hidden accept="image/*">
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Social Section -->
          <div class="s-section" *ngIf="activeSection === 'social'">
            <div class="section-header">
              <h3>Redes Sociales</h3>
              <p>Conecta tu tienda con tus perfiles sociales.</p>
            </div>
            
            <div class="social-links-grid" *ngIf="settings.socialLinks">
              <div class="form-group social-group">
                <label><i class="fab fa-instagram"></i> Instagram</label>
                <div class="social-input">
                  <span>@</span>
                  <input type="text" [(ngModel)]="settings.socialLinks.instagram" placeholder="mi.tienda">
                </div>
              </div>
              <div class="form-group social-group">
                <label><i class="fab fa-facebook"></i> Facebook</label>
                <div class="social-input">
                  <span>/</span>
                  <input type="text" [(ngModel)]="settings.socialLinks.facebook" placeholder="mi.tienda">
                </div>
              </div>
              <div class="form-group social-group">
                <label><i class="fab fa-tiktok"></i> TikTok</label>
                <div class="social-input">
                  <span>@</span>
                  <input type="text" [(ngModel)]="settings.socialLinks.tiktok" placeholder="mi.tienda">
                </div>
              </div>
            </div>
          </div>

          <!-- Business Hours Section -->
          <div class="s-section" *ngIf="activeSection === 'horarios'">
            <div class="section-header">
              <h3>Horario Laboral</h3>
              <p>Define cuándo está abierta tu tienda para recibir pedidos.</p>
            </div>

            <div class="hours-list">
              <div *ngFor="let day of settings.businessHours; let i = index" class="hour-row" [class.is-closed]="!day.enabled">
                <div class="hour-day-info">
                  <div class="ios-toggle" [class.active]="day.enabled" (click)="day.enabled = !day.enabled">
                    <div class="toggle-handle"></div>
                  </div>
                  <span class="day-name">{{ day.day }}</span>
                  <span class="status-badge" [class.active]="day.enabled">
                    {{ day.enabled ? 'ABIERTO' : 'CERRADO' }}
                  </span>
                </div>
                
                <div class="hour-times" *ngIf="day.enabled">
                  <div class="time-box">
                    <label>Desde</label>
                    <div class="time-input-wrapper">
                      <input type="time" [(ngModel)]="day.open">
                      <i class="far fa-clock"></i>
                    </div>
                  </div>
                  <div class="time-sep">a</div>
                  <div class="time-box">
                    <label>Hasta</label>
                    <div class="time-input-wrapper">
                      <input type="time" [(ngModel)]="day.close">
                      <i class="far fa-clock"></i>
                    </div>
                  </div>
                </div>
                
                <div class="hour-closed-msg" *ngIf="!day.enabled">
                  No laborable
                </div>
              </div>
            </div>
          </div>

          <!-- Security Section -->
          <div class="s-section" *ngIf="activeSection === 'security'">
            <div class="section-header">
              <h3>Seguridad de la Cuenta</h3>
              <p>Cambia tu contraseña de acceso al panel administrativo.</p>
            </div>

            <div class="form-group" style="max-width: 400px;">
              <label>Nueva Contraseña (mínimo 6 caracteres)</label>
              <input type="password" [(ngModel)]="newPassword" placeholder="••••••••">
            </div>
            <div class="form-group" style="max-width: 400px;">
              <label>Confirmar Contraseña</label>
              <input type="password" [(ngModel)]="confirmPassword" placeholder="••••••••">
            </div>

            <div *ngIf="passwordMsg" [class.msg-success]="!isPasswordError" [class.msg-error]="isPasswordError" class="feedback-msg" style="margin-bottom: 20px;">
              <i class="fas" [class.fa-check-circle]="!isPasswordError" [class.fa-exclamation-circle]="isPasswordError" style="margin-right: 8px;"></i>
              {{ passwordMsg }}
            </div>

            <button class="btn-action btn-dark" [disabled]="!newPassword || newPassword.length < 6 || isUpdatingPassword" (click)="onChangePassword()">
              <i class="fas" [class.fa-key]="!isUpdatingPassword" [class.fa-spinner]="isUpdatingPassword" [class.fa-spin]="isUpdatingPassword" style="margin-right: 10px;"></i>
              {{ isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
          </div>
        </div>

        <!-- Live Preview Panel -->
        <div class="live-preview-panel" *ngIf="isPreviewActive">
          <div class="preview-frame">
            <div class="preview-browser-header">
              <div class="dots">
                <span></span><span></span><span></span>
              </div>
              <div class="url-bar">{{ settings.slug || 'tienda' }}.uparmall.com</div>
            </div>
            <div class="preview-viewport" [style.font-family]="settings.fontFamily" [style.background]="settings.backgroundColor || '#f0f2f5'">
              <div class="preview-navbar" [style.background]="settings.navbarStyle === 'solid' ? settings.primaryColor : 'rgba(255,255,255,0.85)'" 
                   [style.backdrop-filter]="settings.navbarStyle === 'glass' ? 'blur(10px)' : 'none'">
                <div class="nav-brand">
                  <img [src]="settings.logoUrl || '/assets/logo-uparmall.png'" (error)="$event.target.src = '/assets/logo-uparmall.png'">
                  <span [style.color]="settings.navbarStyle === 'solid' ? '#fff' : '#0f172a'">{{ settings.businessName || 'Mi Tienda' }}</span>
                </div>
                <div class="nav-icons" [style.color]="settings.navbarStyle === 'solid' ? '#fff' : '#64748b'">
                  <i class="fas fa-search"></i>
                  <i class="fas fa-shopping-cart"></i>
                </div>
              </div>
              
              <div class="preview-hero">
                <img [src]="settings.heroSlides?.[0]?.url || 'assets/logo-uparmall.png'" (error)="$event.target.src = 'assets/logo-uparmall.png'">
              </div>

              <div class="preview-body">
                 <div class="preview-grid">
                  <div *ngFor="let p of products.slice(0, 4)" class="preview-product-card">
                    <div class="p-img"><img [src]="p.imageUrl || 'assets/logo-uparmall.png'"></div>
                    <div class="p-info">
                      <div class="p-name">{{ p.name }}</div>
                      <div class="p-price" [style.color]="settings.primaryColor">$ {{ p.price | number }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-editor-container { width: 100%; transition: all 0.3s ease; }
    .settings-layout { display: flex; flex-direction: column; gap: 24px; width: 100%; }
    
    /* Sidebar styling */
    .settings-sidebar { 
      background: white; 
      padding: 15px; 
      border-radius: 24px; 
      border: 1px solid #e2e8f0; 
      display: grid; 
      grid-template-columns: 1fr 1fr;
      gap: 12px; 
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    
    .s-nav-item { 
      padding: 15px 25px; 
      border-radius: 14px; 
      border: none; 
      background: #f8fafc; 
      color: #64748b; 
      font-weight: 800; 
      cursor: pointer; 
      display: flex; 
      flex-direction: column;
      gap: 10px;
      align-items: center; 
      justify-content: center;
      transition: 0.2s; 
      font-size: 0.85rem;
      text-align: center;
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }
    .s-nav-item i { font-size: 1.2rem; margin: 0 !important; }
    .s-nav-item:hover { background: #f1f5f9; color: #0f172a; transform: translateX(5px); }
    .s-nav-item:active { transform: translateX(0) scale(0.98); }
    .s-nav-item.active { background: #0f172a; color: white; box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2); }
    
    /* Main sections */
    .settings-main { width: 100%; display: flex; flex-direction: column; gap: 24px; }
    .s-section { background: white; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
    
    .section-header { margin-bottom: 28px; }
    .section-header h3 { font-size: 1.4rem; font-weight: 950; color: #0f172a; margin: 0 0 6px 0; }
    .section-header p { font-size: 0.95rem; color: #475569; margin: 0; font-weight: 700; }
    .flex-header { display: flex; justify-content: space-between; align-items: flex-end; }

    /* Form controls */
    .form-group { margin-bottom: 22px; width: 100%; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 950; color: #475569; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .label-with-hint { display: flex !important; justify-content: space-between; align-items: center; }
    .label-with-hint span { font-size: 0.75rem; color: #64748b; text-transform: none; font-weight: 700; }

    input[type="text"], input[type="number"], textarea, select { 
      width: 100%; padding: 16px 20px; border-radius: 16px; border: 2px solid #e2e8f0; 
      background: #f8fafc; font-size: 1rem; font-weight: 800; color: #0f172a; transition: 0.2s;
    }
    input:focus, textarea:focus, select:focus { outline: none; border-color: #0f172a; background: white; box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05); }

    .form-grid-3 { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .form-grid-2 { display: grid; grid-template-columns: 1fr; gap: 20px; }

    /* Slug box */
    .slug-box { position: relative; display: flex; align-items: center; }
    .slug-box span { position: absolute; left: 18px; font-weight: 950; color: #475569; font-size: 1.1rem; }
    .slug-box input { padding-left: 35px; }

    /* Logo Upload Refined */
    .logo-upload-card { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: #f8fafc; border-radius: 20px; border: 2px solid #e2e8f0; }
    .logo-preview-container { width: 110px; height: 110px; background: white; border-radius: 18px; border: 2px solid #e2e8f0; overflow: hidden; align-self: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .logo-preview-container img { width: 100%; height: 100%; object-fit: contain; }
    .logo-controls { flex: 1; display: flex; flex-direction: column; gap: 12px; width: 100%; }
    
    .url-input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
    .url-input-wrapper i { position: absolute; left: 16px; color: #475569; font-size: 1rem; }
    .url-input-wrapper input { padding-left: 45px; font-size: 0.9rem; font-weight: 700; color: #1e293b; }

    /* Color Pickers */
    .color-picker-wrapper { display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 12px; border-radius: 16px; border: 2px solid #e2e8f0; }
    .color-picker-wrapper input[type="color"] { width: 50px; height: 50px; border: none; border-radius: 10px; cursor: pointer; padding: 0; background: none; }
    .color-code { font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #0f172a; font-size: 1rem; }

    /* Style Selectors */
    .style-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .style-btn { 
      padding: 18px; border-radius: 16px; border: 2px solid #e2e8f0; background: #f8fafc; 
      display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;
    }
    .style-btn span { font-size: 0.9rem; font-weight: 900; color: #475569; }
    .style-btn:hover { border-color: #0f172a; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.05); }
    .style-btn:active { transform: translateY(0) scale(0.98); }
    .style-btn.active { border-color: #0f172a; background: #0f172a; }
    .style-btn.active:hover { transform: none; box-shadow: none; }
    .style-btn.active span { color: white; }
    .style-icon { width: 44px; height: 14px; border-radius: 4px; }
    .style-icon.glass { background: rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.1); }
    .style-icon.solid { background: #475569; }
    .style-icon.minimal { border-bottom: 3px solid #475569; border-radius: 0; }
    .style-btn.active .style-icon.solid { background: white; }
    .style-btn.active .style-icon.minimal { border-color: white; }

    /* Banners Section */
    .banners-list { display: flex; flex-direction: column; gap: 24px; }
    .banner-card { background: white; border-radius: 20px; border: 2px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; }
    .banner-preview { height: 160px; background: #f1f5f9; position: relative; }
    .banner-preview img { width: 100%; height: 100%; object-fit: cover; }
    .banner-overlay { position: absolute; top: 12px; right: 12px; }
    .btn-icon-delete { width: 36px; height: 36px; border-radius: 50%; background: #ef4444; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: 0.2s; }
    .btn-icon-delete:hover { transform: scale(1.15); background: #dc2626; }
    .banner-details { padding: 24px; flex: 1; }
    .banner-actions { margin-top: 20px; }

    /* Business Hours Section - Fixed Alignment */
    .hours-list { display: flex; flex-direction: column; gap: 15px; }
    .hour-row { 
      display: flex; flex-direction: column; padding: 24px; background: white; 
      border-radius: 24px; border: 2px solid #e2e8f0; gap: 20px; transition: 0.2s; 
    }
    .hour-row.is-closed { opacity: 0.7; background: #f8fafc; border-style: dashed; }
    .hour-day-info { display: flex; align-items: center; gap: 18px; width: 100%; }
    
    .day-name { font-size: 1.1rem; font-weight: 950; color: #0f172a; flex: 1; }
    .status-badge { padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 950; background: #e2e8f0; color: #475569; }
    .status-badge.active { background: #dcfce7; color: #059669; }

    .hour-times { display: flex; align-items: center; gap: 20px; background: #f8fafc; padding: 18px; border-radius: 18px; border: 2px solid #e2e8f0; }
    .time-box { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .time-box label { font-size: 0.7rem; font-weight: 950; color: #475569; text-transform: uppercase; margin: 0; }
    .time-input-wrapper { position: relative; display: flex; align-items: center; }
    .time-input-wrapper input { padding: 10px 14px; padding-right: 40px; border-radius: 12px; border: 2px solid #e2e8f0; background: white; font-size: 1rem; font-weight: 900; width: 100%; color: #0f172a; }
    .time-input-wrapper i { position: absolute; right: 14px; color: #475569; font-size: 1.1rem; pointer-events: none; }
    .time-sep { font-weight: 950; color: #475569; padding-top: 15px; font-size: 1.1rem; }
    .hour-closed-msg { font-weight: 900; color: #64748b; font-size: 1rem; }

    /* Toggle switch */
    .ios-toggle { width: 50px; height: 28px; background: #cbd5e1; border-radius: 100px; position: relative; cursor: pointer; transition: 0.3s; }
    .ios-toggle.active { background: #10b981; }
    .toggle-handle { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .ios-toggle.active .toggle-handle { left: 25px; }

    /* Social Section */
    .social-links-grid { display: flex; flex-direction: column; gap: 20px; }
    .social-group label { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
    .social-group label i { font-size: 20px; color: #0f172a; }
    .social-input { position: relative; display: flex; align-items: center; }
    .social-input span { position: absolute; left: 16px; font-weight: 950; color: #475569; font-size: 1.1rem; }
    .social-input input { padding-left: 40px; }

    /* Buttons */
    .btn-action { display: flex; align-items: center; gap: 10px; padding: 14px 24px; border-radius: 16px; font-weight: 850; border: none; cursor: pointer; transition: 0.2s; font-size: 0.95rem; }
    .btn-dark { background: #0f172a; color: white; }
    .btn-dark:hover { background: #1e293b; transform: translateY(-2px); }
    .btn-light { background: #f1f5f9; color: #475569; }
    .btn-light:hover { background: #e2e8f0; }
    .btn-upload { background: #0f172a; color: white; width: fit-content; }
    .btn-light-full { width: 100%; background: #f8fafc; border: 2px solid #f1f5f9; color: #0f172a; justify-content: center; }
    .btn-danger { background: #fee2e2; color: #dc2626; }

    /* Live Preview Styling */
    .live-preview-panel { width: 100%; display: flex; justify-content: center; margin-top: 40px; }
    .preview-frame { width: 320px; height: 640px; background: #0f172a; border-radius: 40px; padding: 12px; box-shadow: 0 40px 100px rgba(0,0,0,0.15); border: 1px solid #334155; }
    .preview-browser-header { background: #1e293b; border-radius: 30px 30px 0 0; padding: 15px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .preview-browser-header .dots { display: flex; gap: 6px; align-self: flex-start; }
    .preview-browser-header .dots span { width: 8px; height: 8px; border-radius: 50%; }
    .preview-browser-header .dots span:nth-child(1) { background: #ff5f56; }
    .preview-browser-header .dots span:nth-child(2) { background: #ffbd2e; }
    .preview-browser-header .dots span:nth-child(3) { background: #27c93f; }
    .preview-browser-header .url-bar { background: #0f172a; color: #64748b; font-size: 0.65rem; padding: 6px 15px; border-radius: 100px; width: 100%; text-align: center; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    .preview-viewport { background: white; height: calc(100% - 70px); border-radius: 0 0 28px 28px; overflow-y: auto; overflow-x: hidden; position: relative; }
    .preview-viewport::-webkit-scrollbar { width: 4px; }
    .preview-navbar { padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }
    .nav-brand { display: flex; align-items: center; gap: 8px; }
    .nav-brand img { width: 24px; height: 24px; border-radius: 4px; object-fit: cover; }
    .nav-brand span { font-size: 0.75rem; font-weight: 900; }
    .nav-icons { display: flex; gap: 10px; font-size: 0.8rem; }

    .preview-hero { width: 100%; height: 140px; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
    .preview-hero img { width: 100%; height: 100%; object-fit: cover; }

    .preview-body { padding: 15px; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .preview-product-card { background: white; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
    .p-img { height: 80px; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 8px; }
    .p-img img { width: 100%; height: 100%; object-fit: contain; }
    .p-info { padding: 10px; }
    .p-name { font-size: 0.65rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; line-height: 1.2; height: 2.4em; overflow: hidden; }
    .p-price { font-size: 0.75rem; font-weight: 900; }

    /* Desktop overrides */
    @media (min-width: 1101px) {
      .settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; }
      .settings-editor-container.with-preview .settings-layout { grid-template-columns: 240px 1fr 340px; }
      .settings-sidebar { display: flex; flex-direction: column; position: sticky; top: 20px; height: fit-content; padding: 20px; overflow-x: visible; gap: 10px; }
      .s-nav-item { width: 100%; }
      
      .form-grid-3 { grid-template-columns: repeat(3, 1fr); }
      .form-grid-2 { grid-template-columns: 1fr 1fr; }
      
      .logo-upload-card { flex-direction: row; align-items: center; }
      .logo-preview-container { margin: 0; flex-shrink: 0; }
      
      .banner-card { flex-direction: row; }
      .banner-preview { width: 220px; height: 160px; flex-shrink: 0; }
      
      .hour-row { flex-direction: row; align-items: center; }
      .hour-day-info { width: 280px; flex-shrink: 0; }
      .hour-times { flex: 1; padding: 10px 20px; }
      
      .social-links-grid { grid-template-columns: 1fr 1fr 1fr; }

      .live-preview-panel { width: 340px; margin-top: 0; position: sticky; top: 20px; height: fit-content; }
    }
  `]

})
export class SettingsComponent {
  @Input() settings: Settings | null = null;
  @Input() products: Product[] = [];
  @Input() isPreviewActive = true;
  @Output() save = new EventEmitter<void>();
  @Output() updatePreview = new EventEmitter<void>();
  @Output() uploadLogo = new EventEmitter<any>();
  @Output() addSlide = new EventEmitter<void>();
  @Output() removeSlide = new EventEmitter<number>();
  @Output() uploadSlide = new EventEmitter<{event: any, index: number}>();
  @Output() changePassword = new EventEmitter<string>();

  activeSection: 'general' | 'colors' | 'hero' | 'social' | 'horarios' | 'security' = 'general';

  newPassword = '';
  confirmPassword = '';
  isUpdatingPassword = false;
  passwordMsg = '';
  isPasswordError = false;
  
  toggleDelivery() {
    if (!this.settings) return;
    this.settings.hasDelivery = !this.settings.hasDelivery;
  }

  onChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.isPasswordError = true;
      this.passwordMsg = 'Las contraseñas no coinciden';
      return;
    }

    this.isUpdatingPassword = true;
    this.passwordMsg = '';
    this.isPasswordError = false;

    this.changePassword.emit(this.newPassword);
  }

  public setPasswordFeedback(msg: string, isError: boolean) {
    this.isUpdatingPassword = false;
    this.passwordMsg = msg;
    this.isPasswordError = isError;
    if (!isError) {
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }

  fontOptions = [
    { name: 'Inter (Moderna)', value: "'Inter', sans-serif" },
    { name: 'Outfit (Premium)', value: "'Outfit', sans-serif" },
    { name: 'Montserrat (Geométrica)', value: "'Montserrat', sans-serif" },
    { name: 'Poppins (Minimalista)', value: "'Poppins', sans-serif" },
    { name: 'Playfair (Clásica)', value: "'Playfair Display', serif" },
    { name: 'Dancing Script (Escrita)', value: "'Dancing Script', cursive" },
    { name: 'Satisfy (Elegante)', value: "'Satisfy', cursive" }
  ];
}
