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
            <i class="fas fa-info-circle" style="margin-right: 12px;"></i> Información
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'colors'" (click)="activeSection = 'colors'">
            <i class="fas fa-palette" style="margin-right: 12px;"></i> Apariencia
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'hero'" (click)="activeSection = 'hero'">
            <i class="fas fa-images" style="margin-right: 12px;"></i> Banners
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'social'" (click)="activeSection = 'social'">
            <i class="fas fa-share-alt" style="margin-right: 12px;"></i> Redes
          </button>
          <button class="s-nav-item" [class.active]="activeSection === 'horarios'" (click)="activeSection = 'horarios'">
            <i class="fas fa-clock" style="margin-right: 12px;"></i> Horarios
          </button>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
            <button class="btn-action btn-dark" style="width: 100%" (click)="save.emit()">
              <i class="fas fa-save" style="margin-right: 10px;"></i> Guardar Todo
            </button>
          </div>
        </div>

        <div class="settings-main">
          <!-- General Section -->
          <div class="s-section" *ngIf="activeSection === 'general'">
            <h3>Identidad de la Tienda</h3>
            <div class="form-group">
              <label>Nombre del Negocio</label>
              <input type="text" [(ngModel)]="settings.businessName" (input)="updatePreview.emit()" placeholder="Mi Tienda">
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
              <label style="display: flex; justify-content: space-between;">
                Logo del Negocio
                <span style="font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: none; letter-spacing: 0;">Recomendado: 500x500px</span>
              </label>
              <div class="logo-upload">
                <div class="logo-preview">
                  <img [src]="settings.logoUrl || '/assets/logo-uparmall.png'" 
                       (error)="$event.target.src = '/assets/logo-uparmall.png'"
                       alt="Logo">
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                  <input type="text" [(ngModel)]="settings.logoUrl" placeholder="URL del logo">
                  <label class="btn-action btn-light" style="width: fit-content; cursor: pointer;">
                    <i class="fas fa-upload" style="margin-right: 8px;"></i> Subir Imagen
                    <input type="file" (change)="uploadLogo.emit($event)" hidden accept="image/*">
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Appearance Section -->
          <div class="s-section" *ngIf="activeSection === 'colors'">
            <h3>Estilo y Colores</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Color Principal</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <input type="color" [(ngModel)]="settings.primaryColor" (input)="updatePreview.emit()" style="width: 60px; height: 50px; padding: 5px;">
                  <span style="font-weight: 700; font-family: monospace;">{{ settings.primaryColor }}</span>
                </div>
              </div>
              <div class="form-group">
                <label>Fondo de Página</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <input type="color" [(ngModel)]="settings.backgroundColor" (input)="updatePreview.emit()" style="width: 60px; height: 50px; padding: 5px;">
                  <span style="font-weight: 700; font-family: monospace;">{{ settings.backgroundColor }}</span>
                </div>
              </div>
            </div>
            <div class="form-group">
                  <label>Tipografía del Sitio</label>
                  <select [(ngModel)]="settings.fontFamily" (change)="updatePreview.emit()">
                    <option *ngFor="let font of fontOptions" [value]="font.value">{{ font.name }}</option>
                  </select>
            </div>
            <div class="form-group">
              <label>Estilo de Barra de Navegación</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <button class="btn-action btn-light" [class.btn-dark]="settings.navbarStyle === 'glass'" (click)="settings.navbarStyle = 'glass'; updatePreview.emit()">Cristal</button>
                <button class="btn-action btn-light" [class.btn-dark]="settings.navbarStyle === 'solid'" (click)="settings.navbarStyle = 'solid'; updatePreview.emit()">Sólido</button>
                <button class="btn-action btn-light" [class.btn-dark]="settings.navbarStyle === 'minimal'" (click)="settings.navbarStyle = 'minimal'; updatePreview.emit()">Mínimo</button>
              </div>
            </div>
          </div>

          <div class="s-section" *ngIf="activeSection === 'hero'">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
              <div>
                <h3 style="margin: 0; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  Banners Publicitarios
                  <span style="font-size: 0.8rem; color: #64748b; font-weight: 700; letter-spacing: 0; background: #f1f5f9; padding: 4px 12px; border-radius: 8px;">Recomendado: 1200x400px (3:1)</span>
                </h3>
              </div>
              <button class="btn-action btn-dark" (click)="addSlide.emit()" style="padding: 12px 20px; gap: 10px; height: 48px;">
                <i class="fas fa-plus"></i> Añadir Nuevo Banner
              </button>
            </div>

            <div class="banner-card" *ngFor="let slide of settings.heroSlides; let i = index">
              <div class="banner-preview-box">
                <img [src]="slide.url || '/assets/logo-uparmall.png'" 
                     (error)="$event.target.src = '/assets/logo-uparmall.png'"
                     alt="Slide Preview">
              </div>

              <div class="banner-info-fields">
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-size: 0.7rem;">URL de la Imagen</label>
                  <input type="text" [(ngModel)]="slide.url" (input)="updatePreview.emit()" placeholder="Pega el enlace de la imagen aquí">
                </div>
                <div style="margin-top: 15px; display: flex; gap: 12px;">
                  <label class="btn-action btn-light" style="flex: 1; justify-content: center; cursor: pointer; margin: 0;">
                    <i class="fas fa-upload" style="margin-right: 8px;"></i> Cambiar Imagen
                    <input type="file" (change)="uploadSlide.emit({event: $event, index: i})" hidden accept="image/*">
                  </label>
                  <button class="btn-action btn-danger" style="flex: 1; justify-content: center;" (click)="removeSlide.emit(i)">
                    <i class="fas fa-trash-alt" style="margin-right: 8px;"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Social Section -->
          <div class="s-section" *ngIf="activeSection === 'social'">
            <h3>Redes Sociales</h3>
            <div *ngIf="settings.socialLinks">
              <div class="form-group">
                <label>Instagram (@usuario)</label>
                <input type="text" [(ngModel)]="settings.socialLinks.instagram" placeholder="mi.tienda">
              </div>
              <div class="form-group">
                <label>Facebook (link)</label>
                <input type="text" [(ngModel)]="settings.socialLinks.facebook" placeholder="facebook.com/mi.tienda">
              </div>
              <div class="form-group">
                <label>TikTok (@usuario)</label>
                <input type="text" [(ngModel)]="settings.socialLinks.tiktok" placeholder="mi.tienda">
              </div>
            </div>
          </div>

          <!-- Business Hours Section -->
          <div class="s-section" *ngIf="activeSection === 'horarios'">
            <div style="margin-bottom: 30px;">
              <h3 style="margin: 0;">Horario Laboral</h3>
            </div>

            <div class="hours-grid">
              <div *ngFor="let day of settings.businessHours; let i = index" class="day-row" [class.day-disabled]="!day.enabled">
                <div class="day-info">
                  <div class="switch-container" (click)="day.enabled = !day.enabled">
                    <div class="ios-switch" [class.active]="day.enabled">
                      <div class="switch-handle"></div>
                    </div>
                    <span class="status-label" [style.color]="day.enabled ? '#10b981' : '#94a3b8'">
                      {{ day.enabled ? 'ABIERTO' : 'CERRADO' }}
                    </span>
                  </div>
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
                  Cerrado
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
              <span style="color: #64748b; font-size: 0.75rem; font-weight: 800;">Vista Previa</span>
            </div>
            <div class="preview-content-scroller" [style.font-family]="settings.fontFamily" [style.background]="'#f0f2f5'">
              <div [style.background]="settings.navbarStyle === 'solid' ? settings.primaryColor : 'rgba(255,255,255,0.9)'" 
                   style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px);">
                <span style="font-weight: 900; font-size: 0.8rem;" [style.color]="settings.navbarStyle === 'solid' ? '#fff' : '#000'">{{ settings.businessName }}</span>
                <img [src]="settings.logoUrl || '/assets/logo-uparmall.png'" 
                     (error)="$event.target.src = '/assets/logo-uparmall.png'"
                     style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover;">
              </div>
              <div style="width: 100%; height: 180px; position: relative; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center;">
                <img [src]="settings.heroSlides?.[0]?.url || 'assets/logo-uparmall.png'" style="width: 100%; height: 100%; object-fit: contain;">
              </div>
              <div style="padding: 20px;" [style.background]="settings.backgroundColor || '#f0f2f5'">
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div *ngFor="let p of products.slice(0, 4)" style="background: white; border-radius: 18px; border: 1px solid rgba(0,0,0,0.03); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                    <div style="height: 100px; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 10px;">
                      <img [src]="p.imageUrl || 'assets/logo-uparmall.png'" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div style="padding: 12px; flex: 1;">
                      <div style="font-size: 0.7rem; font-weight: 850; margin-bottom: 6px; color: #0f172a; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.2;">{{ p.name }}</div>
                      <span style="font-weight: 950; font-size: 0.85rem; color: #0f172a;">$ {{ p.price | number }}</span>
                    </div>
                  </div>
                </div>
                <div *ngIf="products.length === 0" style="text-align: center; padding: 40px 10px;">
                   <p style="font-size: 0.75rem; color: #64748b; font-weight: 700;">No hay productos para mostrar en la vista previa</p>
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
    .settings-layout { display: flex; flex-direction: column; gap: 20px; width: 100%; }
    
    .settings-sidebar { 
      background: white; 
      padding: 12px 15px; 
      border-radius: 18px; 
      border: 1px solid #e2e8f0; 
      display: flex; 
      overflow-x: auto; 
      gap: 12px; 
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      width: 100%;
      margin-bottom: 20px;
    }
    .settings-sidebar::-webkit-scrollbar { display: none; }
    
    .s-nav-item { 
      padding: 10px 20px; 
      border-radius: 12px; 
      border: none; 
      background: #f1f5f9; 
      color: #475569; 
      font-weight: 800; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      transition: 0.2s; 
      font-size: 0.85rem;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .s-nav-item i { font-size: 14px; opacity: 0.7; }
    .s-nav-item:hover { background: #e2e8f0; color: #0f172a; }
    .s-nav-item.active { background: #0f172a; color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
    
    .settings-main { width: 100%; display: flex; flex-direction: column; gap: 20px; }

    .s-section { background: white; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); width: 100%; }
    .s-section h3 { font-size: 1.3rem; font-weight: 950; margin-bottom: 20px; color: #0f172a; }

    .form-group { margin-bottom: 18px; width: 100%; }
    .form-group label { display: block; font-size: 0.7rem; font-weight: 900; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; }
    .form-group input, .form-group textarea, .form-group select { 
      width: 100% !important; 
      padding: 12px; 
      border-radius: 12px; 
      border: 1px solid #e2e8f0; 
      background: #f8fafc; 
      font-size: 0.95rem; 
      font-weight: 700; 
      color: #0f172a; 
      box-sizing: border-box;
    }
    .form-row { display: flex; flex-direction: column; gap: 15px; }

    .logo-upload { display: flex; flex-direction: column; gap: 15px; padding: 15px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; }
    .logo-preview { width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: white; border: 1px solid #eee; align-self: center; }

    .banner-card { background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 15px; }
    .banner-preview-box { height: 120px; border-radius: 10px; overflow: hidden; background: #e2e8f0; width: 100%; }
    .banner-preview-box img { width: 100%; height: 100%; object-fit: contain; }

    .hours-grid { display: flex; flex-direction: column; gap: 10px; width: 100%; }
    .day-row { display: flex; flex-direction: column; padding: 15px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; gap: 12px; }
    .day-info { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .time-inputs { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px; }
    .time-field { width: 45% !important; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; font-weight: 700; }

    .live-preview-panel { width: 100%; margin-top: 40px; display: flex; justify-content: center; }
    .preview-frame { background: #0f172a; border-radius: 30px; border: 6px solid #1e293b; height: 600px; width: 300px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }

    /* Desktop overrides */
    @media (min-width: 1101px) {
      .settings-layout { display: grid; grid-template-columns: 250px 1fr; gap: 30px; }
      .settings-editor-container.with-preview .settings-layout { grid-template-columns: 250px 1fr 320px; }
      .settings-sidebar { flex-direction: column; position: sticky; top: 20px; overflow-x: visible; height: fit-content; padding: 20px; }
      .s-nav-item { width: 100%; margin-bottom: 5px; }
      .form-row { flex-direction: row; }
      .banner-card { flex-direction: row; grid-template-columns: 180px 1fr; }
      .day-row { flex-direction: row; }
      .live-preview-panel { width: 320px; margin-top: 0; }
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

  activeSection: 'general' | 'colors' | 'hero' | 'social' | 'horarios' = 'general';

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
