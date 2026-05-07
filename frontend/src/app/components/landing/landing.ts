import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-container">
      <div class="hero-content">
        <h1>Bienvenido a UparMall</h1>
        <p>La plataforma ideal para digitalizar tu negocio. Crea tu tienda en línea en minutos, gestiona tu inventario y recibe pedidos por WhatsApp.</p>
        <div class="cta-buttons">
          <a [href]="adminUrl + '/login'" class="primary-btn">Crea tu Tienda o Inicia Sesión</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .hero-content {
      max-width: 800px;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
      padding: 60px 40px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 800; }
    p { font-size: 1.2rem; margin-bottom: 40px; line-height: 1.6; opacity: 0.9; }
    .cta-buttons { display: flex; justify-content: center; gap: 20px; }
    .primary-btn {
      background: white;
      color: #764ba2;
      padding: 15px 30px;
      border-radius: 30px;
      font-size: 1.1rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .primary-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 25px rgba(0,0,0,0.2);
    }
  `]
})
export class LandingComponent {
  adminUrl = environment.adminUrl;
}
