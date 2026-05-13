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
      <!-- Animated Background Blobs -->
      <div class="blob-wrapper">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>

      <!-- Navbar -->
      <nav class="landing-nav">
        <div class="nav-content">
          <div class="logo-group">
            <img src="/assets/logo-uparmall.png" alt="UparMall">
            <span>UparMall</span>
          </div>
          <a [href]="adminUrl" class="btn-login">
            <i class="fas fa-right-to-bracket"></i> Ingreso
          </a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <span class="badge">Digitaliza tu éxito</span>
          <h1>Tu tienda, tu marca,<br><span class="gradient-text">tu espacio.</span></h1>
          <p>La plataforma integral para crear tu catálogo digital en minutos, gestionar inventario y vender profesionalmente por WhatsApp.</p>
        </div>
      </section>

      <!-- About Section (NOW ABOVE SLIDER) -->
      <section id="about" class="about-section">
        <div class="section-header">
          <h2>¿Por qué elegir UparMall?</h2>
          <div class="divider"></div>
        </div>
        <div class="about-grid">
          <div class="about-card">
            <div class="icon-box"><i class="fas fa-bolt"></i></div>
            <h3>Rapidez Total</h3>
            <p>Configura tu tienda y sube tus productos en menos de 10 minutos. Sin complicaciones técnicas.</p>
          </div>
          <div class="about-card">
            <div class="icon-box"><i class="fab fa-whatsapp"></i></div>
            <h3>Venta por WhatsApp</h3>
            <p>Recibe pedidos organizados directamente en tu chat. Cierra ventas de forma humana y efectiva.</p>
          </div>
          <div class="about-card">
            <div class="icon-box"><i class="fas fa-chart-line"></i></div>
            <h3>Control Total</h3>
            <p>Gestiona stock, estadísticas y fidelización de clientes desde un panel administrativo intuitivo.</p>
          </div>
        </div>
      </section>

      <!-- Store Slider Section -->
      <section class="stores-section" *ngIf="stores.length > 0">
        <div class="section-header">
          <h2>Marcas que confían en nosotros</h2>
          <div class="divider"></div>
        </div>
        
        <div class="slider-container">
          <div class="slider-track">
            <!-- Items duplicated for seamless loop -->
            <div class="store-logo-item" *ngFor="let store of infiniteStoresList" (click)="goToStore(store.slug)">
              <div class="logo-wrapper">
                <img [src]="store.logo" [alt]="store.name">
              </div>
              <span class="store-name">{{ store.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="contact-section">
        <div class="contact-card">
          <div class="contact-info">
            <h2>¿Quieres digitalizar tu negocio?</h2>
            <p>Déjanos tus datos y nos pondremos en contacto contigo para ayudarte a crear tu tienda en UparMall.</p>
          </div>
          <form class="contact-form" (ngSubmit)="onContactSubmit()">
            <div class="form-group">
              <input type="text" placeholder="Nombre completo" name="name" [(ngModel)]="contactData.name" required>
            </div>
            <div class="form-group">
              <input type="email" placeholder="Correo electrónico" name="email" [(ngModel)]="contactData.email" required>
            </div>
            <div class="form-group">
              <input type="tel" placeholder="WhatsApp / Teléfono" name="phone" [(ngModel)]="contactData.phone" required>
            </div>
            <div class="form-group">
              <textarea placeholder="Cuéntanos un poco sobre tu negocio" name="message" [(ngModel)]="contactData.message"></textarea>
            </div>
            <button type="submit" class="btn-primary" [disabled]="isSubmitting">
              <i class="fas fa-paper-plane"></i> {{ isSubmitting ? 'Enviando...' : 'Enviar información' }}
            </button>
            <p class="success-msg" *ngIf="contactSuccess">¡Gracias! Te contactaremos muy pronto.</p>
          </form>
        </div>
      </section>

      <footer class="landing-footer">
        <p>&copy; 2026 UparMall. Todos los derechos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

    :host {
      --primary: #0096ff;
      --secondary: #8e24aa;
      --dark: #0f172a;
      --bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      font-family: 'Outfit', sans-serif;
    }

    .landing-container {
      background: #0f172a;
      min-height: 100vh;
      color: white;
      overflow-x: hidden;
      position: relative;
    }

    /* Animated Blobs */
    .blob-wrapper {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      z-index: 0; overflow: hidden; pointer-events: none;
    }
    .blob {
      position: absolute; border-radius: 50%; filter: blur(80px);
      opacity: 0.4; animation: float 20s infinite alternate ease-in-out;
    }
    .blob-1 { width: 600px; height: 600px; background: #6366f1; top: -10%; left: -10%; animation-duration: 25s; }
    .blob-2 { width: 500px; height: 500px; background: #a855f7; bottom: -10%; right: -10%; animation-delay: -5s; }
    .blob-3 { width: 400px; height: 400px; background: #0096ff; top: 40%; right: 20%; animation-duration: 30s; animation-delay: -10s; }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(50px, 100px) scale(1.1); }
      66% { transform: translate(-50px, 50px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }

    /* Nav */
    .landing-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 15px 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .nav-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
    .logo-group { display: flex; align-items: center; gap: 12px; }
    .logo-group img { width: 36px; height: 36px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    .logo-group span { font-weight: 800; font-size: 1.3rem; letter-spacing: -1px; color: white; }
    .btn-login { 
      text-decoration: none; color: white; font-weight: 700; font-size: 0.9rem; 
      padding: 10px 24px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); 
      background: rgba(255,255,255,0.05); transition: 0.3s; display: flex; align-items: center; gap: 8px;
    }
    .btn-login:hover { background: white; color: #0f172a; transform: translateY(-2px); }

    /* Hero */
    .hero-section {
      min-height: 90vh; display: flex; align-items: center; justify-content: center;
      position: relative; padding: 140px 20px 60px; text-align: center;
      animation: fadeIn 1.2s ease-out;
    }
    .hero-content { 
      position: relative; z-index: 1; max-width: 850px; 
      background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(30px);
      padding: 80px 40px; border-radius: 48px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
    }
    .badge { background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 8px 24px; border-radius: 100px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; display: inline-block; border: 1px solid rgba(99, 102, 241, 0.3); }
    h1 { font-size: 5rem; line-height: 1; margin-bottom: 25px; font-weight: 900; letter-spacing: -4px; color: white; }
    .gradient-text { background: linear-gradient(90deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 1.4rem; color: #94a3b8; max-width: 700px; margin: 0 auto 40px; line-height: 1.5; font-weight: 400; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Section Header */
    .section-header { text-align: center; margin-bottom: 70px; animation: fadeIn 1s both; }
    .section-header h2 { font-size: 2.8rem; font-weight: 900; color: white; letter-spacing: -2px; }
    .divider { width: 80px; height: 5px; background: linear-gradient(90deg, #6366f1, #a855f7); margin: 20px auto; border-radius: 10px; }

    /* Stores Section */
    .stores-section { padding: 100px 0; }
    .slider-container { width: 100%; overflow: hidden; padding: 20px 0; position: relative; }
    .slider-track { 
      display: flex; 
      width: max-content; 
      animation: scroll 40s linear infinite; 
      gap: 50px; 
    }
    .slider-track:hover { animation-play-state: paused; }

    .store-logo-item { 
      display: flex; flex-direction: column; align-items: center; gap: 15px; 
      cursor: pointer; transition: 0.3s; width: 160px; flex-shrink: 0;
    }
    .logo-wrapper { 
      width: 110px; height: 110px; border-radius: 28px; background: rgba(255,255,255,0.1); padding: 18px;
      display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.1);
    }
    .logo-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .store-name { font-size: 0.9rem; font-weight: 700; color: rgba(255,255,255,0.9); text-align: center; }
    .store-logo-item:hover { transform: translateY(-8px); }
    .store-logo-item:hover .store-name { color: white; text-shadow: 0 0 10px rgba(255,255,255,0.5); }

    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); } 
    }

    /* About Section */
    .about-section { max-width: 1200px; margin: 40px auto 100px; padding: 0 20px; }
    .about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .about-card { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); padding: 45px 40px; border-radius: 32px; transition: 0.3s; backdrop-filter: blur(15px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .about-card:hover { border-color: white; transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.2); }
    
    .icon-box { 
      width: 64px; height: 64px; border-radius: 20px; background: white; 
      display: flex; align-items: center; justify-content: center; 
      font-size: 1.8rem; margin-bottom: 30px; color: var(--primary); 
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); 
    }
    .about-card h3 { font-size: 1.6rem; font-weight: 800; margin-bottom: 15px; color: white; }
    .about-card p { font-size: 1.1rem; line-height: 1.6; margin: 0; text-align: left; color: rgba(255,255,255,0.8); }

    /* Contact Section */
    .contact-section { max-width: 1200px; margin: 80px auto; padding: 0 20px; }
    .contact-card { 
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 40px; padding: 60px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 60px;
      color: white; box-shadow: 0 30px 60px -12px rgba(0, 150, 255, 0.3);
    }
    .contact-info h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 20px; color: white; letter-spacing: -1px; }
    .contact-info p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 40px; line-height: 1.6; color: white; }

    .contact-form { display: flex; flex-direction: column; gap: 15px; }
    .contact-form .form-group { width: 100%; }
    .contact-form input, .contact-form textarea { 
      width: 100%; padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1); color: white; font-family: inherit; font-size: 1rem;
      transition: 0.3s;
    }
    .contact-form input::placeholder, .contact-form textarea::placeholder { color: rgba(255,255,255,0.6); }
    .contact-form input:focus, .contact-form textarea:focus { background: rgba(255,255,255,0.2); outline: none; border-color: white; }
    .contact-form textarea { height: 120px; resize: none; }
    .contact-form .btn-primary { 
      background: #ffffff; color: #0096ff !important; width: 100%; border: none; 
      box-shadow: 0 10px 20px rgba(0,0,0,0.1); display: flex; align-items: center; 
      justify-content: center; gap: 10px; font-weight: 800; min-height: 55px;
    }
    .contact-form .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }
    .success-msg { margin-top: 15px; font-weight: 800; text-align: center; color: #4ade80; }

    footer { text-align: center; padding: 60px 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 0.9rem; font-weight: 600; }

    @media (max-width: 992px) {
      .contact-card { grid-template-columns: 1fr; padding: 40px; gap: 40px; }
      .contact-info h2 { font-size: 2rem; }
    }

    @media (max-width: 768px) {
      h1 { font-size: 2.8rem; letter-spacing: -1px; }
      p { font-size: 1.1rem; }
      .about-grid { grid-template-columns: 1fr; }
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
        // 1. Separamos destacadas de las normales
        const featured = data.filter(s => s.is_featured);
        // 2. Aleatorizamos las normales
        const others = data.filter(s => !s.is_featured).sort(() => Math.random() - 0.5);
        
        // 3. Unimos: primero las destacadas, luego el resto al azar
        const displayData = [...featured, ...others];

        if (displayData.length > 0) {
          const itemWidth = 210;
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
