import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <div class="glass-panel">
        <div class="brand">
          <h1>UparMall</h1>
          <p>Tu tienda en línea en minutos</p>
        </div>

        <div class="auth-section">
          <!-- Tabs -->
          <div class="auth-tabs" *ngIf="mode === 'login' || mode === 'register'">
            <button [class.active]="mode === 'login'" (click)="mode = 'login'">Ingresar</button>
            <button [class.active]="mode === 'register'" (click)="mode = 'register'">Crear Tienda</button>
          </div>

          <!-- Login Form -->
          <form *ngIf="mode === 'login'" (ngSubmit)="onLogin()">
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" [(ngModel)]="email" name="email" required>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" [(ngModel)]="password" name="password" required>
            </div>
            <button type="button" class="forgot-link" (click)="mode = 'forgot'">¿Olvidaste tu contraseña?</button>
            
            <button type="submit" class="submit-btn" [disabled]="loading">
              {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <!-- Register Form -->
          <form *ngIf="mode === 'register'" (ngSubmit)="onRegister()">
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" [(ngModel)]="email" name="email" required>
            </div>
            <div class="form-group">
              <label>Contraseña (mínimo 6 caracteres)</label>
              <input type="password" [(ngModel)]="password" name="password" required>
            </div>
            <button type="submit" class="submit-btn" [disabled]="loading">
              {{ loading ? 'Creando tienda...' : 'Registrarse' }}
            </button>
            <p class="hint">Al registrarte, podrás configurar el nombre y la URL de tu tienda en el panel de administración.</p>
          </form>

          <!-- Forgot Password Form -->
          <form *ngIf="mode === 'forgot'" (ngSubmit)="onForgotPassword()">
            <h3>Recuperar Contraseña</h3>
            <p class="hint">Te enviaremos un enlace a tu correo para restablecer tu contraseña.</p>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" [(ngModel)]="email" name="email" required>
            </div>
            <button type="submit" class="submit-btn" [disabled]="loading">
              {{ loading ? 'Enviando...' : 'Enviar Enlace' }}
            </button>
            <button type="button" class="cancel-btn" (click)="mode = 'login'">Volver al Inicio</button>
          </form>

          <!-- Update Password Form (After clicking email link) -->
          <form *ngIf="mode === 'update-password'" (ngSubmit)="onUpdatePassword()">
            <h3>Actualizar Contraseña</h3>
            <p class="hint">Ingresa tu nueva contraseña para continuar.</p>
            <div class="form-group">
              <label>Nueva Contraseña</label>
              <input type="password" [(ngModel)]="password" name="password" required>
            </div>
            <button type="submit" class="submit-btn" [disabled]="loading">
              {{ loading ? 'Actualizando...' : 'Guardar y Entrar' }}
            </button>
          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .brand { text-align: center; margin-bottom: 30px; }
    .brand h1 { color: #3f51b5; margin: 0 0 10px 0; font-size: 2rem; }
    .brand p { color: #666; margin: 0; }
    
    .auth-tabs { display: flex; margin-bottom: 25px; border-radius: 12px; background: #eee; padding: 5px; }
    .auth-tabs button { flex: 1; padding: 10px; border: none; background: transparent; border-radius: 8px; font-weight: 600; color: #666; transition: 0.3s; }
    .auth-tabs button.active { background: white; color: #3f51b5; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; font-size: 0.9rem; }
    .form-group input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
    .form-group input:focus { border-color: #3f51b5; outline: none; box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.1); }
    
    .submit-btn { width: 100%; background: #3f51b5; color: white; padding: 14px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 10px; }
    .submit-btn:hover:not(:disabled) { background: #303f9f; }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .cancel-btn { width: 100%; background: transparent; color: #666; padding: 14px; border: none; font-size: 1rem; cursor: pointer; margin-top: 10px; }
    
    .forgot-link { background: transparent; border: none; color: #3f51b5; padding: 0; font-size: 0.85rem; cursor: pointer; margin-bottom: 15px; text-decoration: underline; }
    .hint { font-size: 0.85rem; color: #666; text-align: center; margin-top: 15px; line-height: 1.4; }
  `]
})
export class HomeComponent {
  mode: 'login' | 'register' | 'forgot' | 'update-password' = 'login';
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Detect if user arrived from a password recovery link
    this.authService.authEvent$.subscribe(event => {
      if (event === 'PASSWORD_RECOVERY') {
        this.mode = 'update-password';
      }
    });
  }

  async onLogin() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa todos los campos');
      return;
    }
    
    this.loading = true;
    try {
      const { data, error } = await this.authService.signIn(this.email, this.password);
      
      if (error) {
        alert('Correo o contraseña incorrectos. Inténtalo de nuevo.');
        this.loading = false;
        return;
      }
      
      if (data?.session) {
        this.router.navigate(['/admin']);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      this.loading = false;
    }
  }

  async onRegister() {
    if (!this.email || !this.password) return alert('Por favor ingresa todos los campos');
    if (this.password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');
    
    this.loading = true;
    try {
      const { error } = await this.authService.signUp(this.email, this.password);
      if (error) throw error;
      alert('¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta (si tienes habilitada la confirmación) o inicia sesión.');
      this.mode = 'login';
    } catch (err: any) {
      alert(err.message || 'Error al registrar');
    } finally {
      this.loading = false;
    }
  }

  async onForgotPassword() {
    if (!this.email) return alert('Por favor ingresa tu correo electrónico');
    this.loading = true;
    try {
      const { error } = await this.authService.resetPassword(this.email);
      if (error) throw error;
      alert('Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada o spam.');
      this.mode = 'login';
    } catch (err: any) {
      alert(err.message || 'Error al solicitar el cambio de contraseña');
    } finally {
      this.loading = false;
    }
  }

  async onUpdatePassword() {
    if (!this.password || this.password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');
    this.loading = true;
    try {
      const { error } = await this.authService.updatePassword(this.password);
      if (error) throw error;
      alert('¡Contraseña actualizada con éxito!');
      this.router.navigate(['/admin']);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar contraseña');
    } finally {
      this.loading = false;
    }
  }
}
