import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { DataService } from '../../shared/services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="landing-container">
      <!-- Navbar -->
      <nav class="landing-nav">
        <div class="nav-content">
          <div class="logo-group">
            <img src="/assets/logo-uparmall.png" alt="UparMall" class="nav-logo">
            <span class="logo-text">UparMall</span>
          </div>
          <a [href]="adminUrl" class="btn-login">Ingreso <i class="fas fa-arrow-right"></i></a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="grid-overlay"></div>
        <div class="hero-content">
          <h1>Digitaliza tu negocio.<br>Domina tus ventas.</h1>
          <p>La infraestructura definitiva para crear tu catálogo digital, gestionar inventarios precisos y escalar tus ventas por WhatsApp con total control.</p>
          <a href="#contact" class="btn-primary">Comenzar ahora</a>
        </div>
      </section>

      <!-- Store Slider Section (Infinite) -->
      <section class="stores-section" *ngIf="stores.length > 0 || infiniteStoresList.length > 0">
        <div class="slider-container">
          <div class="slider-track">
            <div class="store-logo-item" *ngFor="let store of infiniteStoresList" (click)="goToStore(store.slug)">
              <div class="logo-wrapper">
                <img [src]="store.logo" [alt]="store.name">
              </div>
              <span class="store-name">{{ store.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="about" class="features-section">
        <div class="features-header">
          <h2>Arquitectura de alto rendimiento<br>para tu tienda.</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-number">01</div>
            <h3>Rapidez de Despliegue</h3>
            <p>Implementa tu tienda y sincroniza tu catálogo de productos en minutos. Arquitectura diseñada para eliminar la fricción técnica.</p>
          </div>
          <div class="feature-card">
            <div class="feature-number">02</div>
            <h3>Integración WhatsApp</h3>
            <p>Centraliza la recepción de pedidos en tu línea principal. Convierte conversaciones en transacciones cerradas de forma fluida.</p>
          </div>
          <div class="feature-card">
            <div class="feature-number">03</div>
            <h3>Gestión Analítica</h3>
            <p>Control de inventario en tiempo real, trazabilidad de flujo de caja y métricas de fidelización desde un dashboard robusto.</p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="contact-section">
        <div class="contact-wrapper">
          <div class="contact-info">
            <h2>Solicita acceso.</h2>
            <p>Contáctanos para habilitar tu espacio en la plataforma UparMall y digitalizar tu operación.</p>
          </div>
          <form class="contact-form" (ngSubmit)="onContactSubmit()">
            <div class="input-row">
              <input type="text" placeholder="Nombre completo" name="name" [(ngModel)]="contactData.name" required>
            </div>
            <div class="input-row">
              <input type="email" placeholder="Correo electrónico" name="email" [(ngModel)]="contactData.email" required>
            </div>
            <div class="input-row">
              <input type="tel" placeholder="Teléfono corporativo" name="phone" [(ngModel)]="contactData.phone" required>
            </div>
            <div class="input-row">
              <textarea placeholder="Descripción operativa de tu negocio" name="message" [(ngModel)]="contactData.message"></textarea>
            </div>
            <button type="submit" class="btn-submit" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Procesando...' : 'Enviar Solicitud' }}
            </button>
            <p class="success-msg" *ngIf="contactSuccess">Solicitud recibida. Nuestro equipo te contactará en breve.</p>
          </form>
        </div>
      </section>

      <footer class="landing-footer">
        <div class="footer-content">
          <span>&copy; 2026 UparMall Platform. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap');

    :host {
      --bg-dark: #050505;
      --bg-surface: #0a0a0a;
      --border-color: #222222;
      --text-main: #ffffff;
      --text-muted: #cccccc;
      font-family: 'Inter', sans-serif;
    }

    .landing-container {
      background: var(--bg-dark);
      min-height: 100vh;
      color: var(--text-main);
      overflow-x: hidden;
    }

    /* Navbar */
    .landing-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 20px 0; background: rgba(5, 5, 5, 0.8); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
    }
    .nav-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; }
    .logo-group { display: flex; align-items: center; gap: 12px; }
    .nav-logo { width: 28px; height: 28px; object-fit: contain; }
    .logo-text { font-weight: 900; font-size: 1.2rem; letter-spacing: -0.5px; }
    
    .btn-login { 
      text-decoration: none; color: var(--text-muted); font-weight: 600; font-size: 0.85rem; 
      transition: color 0.2s; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px;
    }
    .btn-login:hover { color: white; }

    /* Hero */
    .hero-section {
      min-height: 70vh; display: flex; align-items: center; justify-content: center;
      position: relative; padding: 120px 20px 60px; text-align: center;
      border-bottom: 1px solid var(--border-color);
    }
    .grid-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        linear-gradient(to right, #111 1px, transparent 1px),
        linear-gradient(to bottom, #111 1px, transparent 1px);
      background-size: 60px 60px; pointer-events: none; opacity: 0.5;
    }
    .hero-content { 
      position: relative; z-index: 1; max-width: 900px; 
      animation: heroEnter 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }
    @keyframes heroEnter {
      from { opacity: 0; transform: scale(0.95) translateY(10px); filter: blur(4px); }
      to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
    }
    h1 { font-size: 5.5rem; line-height: 1.05; margin-bottom: 30px; font-weight: 900; letter-spacing: -3px; }
    p { font-size: 1.25rem; color: var(--text-muted); max-width: 650px; margin: 0 auto 50px; line-height: 1.6; font-weight: 400; }
    
    .btn-primary { 
      background: white !important; color: black !important; padding: 18px 40px; text-decoration: none; font-weight: 600;
      display: inline-block; font-size: 1rem; 
      transition: background 160ms cubic-bezier(0.23, 1, 0.32, 1), transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-primary:hover { background: #e0e0e0 !important; }
    .btn-primary:active { transform: scale(0.97); }

    /* Slider (Infinite) */
    .stores-section { border-bottom: 1px solid var(--border-color); background: var(--bg-surface); padding: 60px 0; }
    .slider-container { width: 100%; overflow: hidden; position: relative; }
    
    /* Fade edges */
    .slider-container::before, .slider-container::after {
      content: ""; position: absolute; top: 0; width: 150px; height: 100%; z-index: 2; pointer-events: none;
    }
    .slider-container::before { left: 0; background: linear-gradient(to right, var(--bg-surface), transparent); }
    .slider-container::after { right: 0; background: linear-gradient(to left, var(--bg-surface), transparent); }

    .slider-track { display: flex; width: max-content; animation: scroll-left 40s linear infinite; gap: 80px; padding: 0 40px; }
    .slider-track:hover { animation-play-state: paused; }

    .store-logo-item { 
      display: flex; flex-direction: column; align-items: center; gap: 15px; cursor: pointer; flex-shrink: 0; width: 140px; 
      transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    }
    .logo-wrapper { width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; transition: 200ms cubic-bezier(0.23, 1, 0.32, 1); filter: grayscale(100%) opacity(0.5); }
    .logo-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .store-name { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; transition: 200ms cubic-bezier(0.23, 1, 0.32, 1); }
    
    .store-logo-item:hover .logo-wrapper { filter: grayscale(0%) opacity(1); }
    .store-logo-item:hover .store-name { color: white; }
    .store-logo-item:active { transform: scale(0.95); }

    @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

    /* Features */
    .features-section { padding: 120px 40px; max-width: 1400px; margin: 0 auto; border-bottom: 1px solid var(--border-color); }
    .features-header { margin-bottom: 80px; }
    .features-header h2 { font-size: 3.5rem; font-weight: 900; letter-spacing: -2px; line-height: 1.1; max-width: 700px; }
    
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; }
    .feature-card { 
      border-left: 1px solid var(--border-color); padding-left: 30px; 
      opacity: 0; transform: translateY(15px);
      animation: featureEnter 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }
    .feature-card:nth-child(1) { animation-delay: 100ms; }
    .feature-card:nth-child(2) { animation-delay: 180ms; }
    .feature-card:nth-child(3) { animation-delay: 260ms; }
    @keyframes featureEnter { to { opacity: 1; transform: translateY(0); } }
    .feature-number { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); margin-bottom: 20px; }
    .feature-card h3 { font-size: 1.6rem; font-weight: 600; margin-bottom: 15px; letter-spacing: -0.5px; }
    .feature-card p { font-size: 1.05rem; color: var(--text-muted); line-height: 1.6; margin: 0; }

    /* Contact */
    .contact-section { padding: 120px 40px; max-width: 1400px; margin: 0 auto; }
    .contact-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
    .contact-info h2 { font-size: 3.5rem; font-weight: 900; letter-spacing: -2px; margin-bottom: 20px; }
    .contact-info p { font-size: 1.2rem; color: var(--text-muted); line-height: 1.6; max-width: 500px; }

    .contact-form { display: flex; flex-direction: column; gap: 0; }
    .input-row { border-bottom: 1px solid var(--border-color); }
    .contact-form input, .contact-form textarea { 
      width: 100%; padding: 25px 0; border: none; background: transparent; color: white; 
      font-family: inherit; font-size: 1.2rem; font-weight: 300; transition: border-color 0.3s;
    }
    .contact-form textarea { height: 100px; resize: none; margin-top: 10px; }
    .contact-form input:focus, .contact-form textarea:focus { outline: none; }
    .contact-form input::placeholder, .contact-form textarea::placeholder { color: #555; }
    
    .btn-submit { 
      background: white !important; color: black !important; padding: 20px; border: none; width: 100%; 
      font-weight: 600; font-size: 1.1rem; margin-top: 40px; cursor: pointer; 
      transition: background 160ms cubic-bezier(0.23, 1, 0.32, 1), transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-submit:hover { background: #e0e0e0 !important; }
    .btn-submit:active { transform: scale(0.98); }
    .success-msg { margin-top: 20px; font-weight: 600; color: #fff; font-size: 0.9rem; }

    /* Footer */
    .landing-footer { border-top: 1px solid var(--border-color); padding: 40px; background: var(--bg-surface); }
    .footer-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }

    @media (max-width: 992px) {
      .contact-wrapper { grid-template-columns: 1fr; gap: 60px; }
      h1 { font-size: 4rem; }
    }
    @media (max-width: 768px) {
      h1 { font-size: 3rem; letter-spacing: -1px; }
      .features-header h2 { font-size: 2.5rem; }
      .contact-info h2 { font-size: 2.5rem; }
      .feature-card { border-left: none; border-top: 1px solid var(--border-color); padding-left: 0; padding-top: 30px; }
    }
  `]
})
export class LandingComponent implements OnInit {
  adminUrl = environment.adminUrl;
  stores: any[] = [];
  infiniteStoresList: any[] = [];

  contactData = { name: '', email: '', phone: '', message: '' };
  isSubmitting = false;
  contactSuccess = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getPublicStores().subscribe({
      next: (data) => {
        const featured = data.filter(s => s.is_featured);
        const others = data.filter(s => !s.is_featured).sort(() => Math.random() - 0.5);
        const displayData = [...featured, ...others];

        if (displayData.length > 0) {
          const itemWidth = 220; // Adjusted for new gap/width
          const targetWidth = 4000;
          const repetitions = Math.max(2, Math.ceil(targetWidth / (displayData.length * itemWidth)) * 2);
          
          this.infiniteStoresList = [];
          for (let i = 0; i < repetitions; i++) {
            this.infiniteStoresList.push(...displayData);
          }
        }
      },
      error: (err) => console.error('Error fetching stores:', err)
    });
  }

  onContactSubmit() {
    if (!this.contactData.name || !this.contactData.email || !this.contactData.phone) return;
    
    this.isSubmitting = true;
    
    this.dataService.submitLead(this.contactData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.contactSuccess = true;
        this.contactData = { name: '', email: '', phone: '', message: '' };
        setTimeout(() => this.contactSuccess = false, 5000);
      },
      error: (err) => {
        console.error('Error enviando lead:', err);
        this.isSubmitting = false;
        alert('Hubo un error al enviar la información. Por favor intenta de nuevo.');
      }
    });
  }

  goToStore(slug: string) {
    if (slug) {
      window.location.href = `/${slug}`;
    }
  }
}
