import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <div class="glass-panel">
        <div class="brand">
          <img src="/assets/logo-uparmall.png" alt="UparMall Logo" style="width: 80px; height: 80px; margin-bottom: 15px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h1>UparMall</h1>
          <p>Tu tienda en línea en minutos</p>
        </div>

        <div class="auth-section">
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
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
            <button type="button" class="forgot-link" (click)="mode = 'forgot'">¿Olvidaste tu contraseña?</button>
            <button type="submit" class="submit-btn" [disabled]="loading">
              {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <!-- Forgot Password Form -->
          <form *ngIf="mode === 'forgot'" (ngSubmit)="onForgotPassword()">
            <h3>Recuperar Contraseña</h3>
            <p class="hint">Te enviaremos un enlace a tu correo para restablecer tu contraseña.</p>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" [(ngModel)]="email" name="email" required>
            </div>
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
            <div class="msg success" *ngIf="successMsg">{{ successMsg }}</div>
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
      background: rgba(255, 255, 255, 0.97);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.8);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
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
    .msg { padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; }
    .msg.error { background: #fff0f0; color: #e74c3c; border: 1px solid #f5c6cb; }
    .msg.success { background: #f0fff4; color: #27ae60; border: 1px solid #c3e6cb; }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  mode: 'login' | 'forgot' | 'update-password' = 'login';
  email = '';
  password = '';
  loading = false;
  errorMsg = '';
  successMsg = '';
  private _authSub!: Subscription;

  async ngOnInit() {
    const session = await this.authService.getSession();
    if (session) {
      this.router.navigate(['/']);
    }
  }

  private setMode(m: typeof this.mode) {
    this.mode = m;
    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.detectChanges();
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this._authSub = this.authService.authEvent$.subscribe(event => {
      if (event === 'PASSWORD_RECOVERY') this.setMode('update-password');
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this._authSub?.unsubscribe();
  }

  async onLogin() {
    this.errorMsg = '';
    if (!this.email || !this.password) { this.errorMsg = 'Por favor ingresa todos los campos'; return; }
    this.loading = true;
    const { data, error } = await this.authService.signIn(this.email, this.password);
    this.loading = false;
    if (error) { this.errorMsg = 'Correo o contraseña incorrectos'; this.cdr.detectChanges(); return; }
    if (data?.session) {
      this.router.navigate(['/']);
    }
    this.cdr.detectChanges();
  }

  async onForgotPassword() {
    this.errorMsg = ''; this.successMsg = '';
    if (!this.email) { this.errorMsg = 'Por favor ingresa tu correo electrónico'; return; }
    this.loading = true;
    try {
      const { error } = await this.authService.resetPassword(this.email);
      if (error) throw error;
      this.successMsg = 'Enlace de recuperación enviado. Revisa tu bandeja o spam.';
    } catch (err: any) {
      this.errorMsg = err.message || 'Error al solicitar el cambio de contraseña';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async onUpdatePassword() {
    this.errorMsg = '';
    if (!this.password || this.password.length < 6) { this.errorMsg = 'La contraseña debe tener al menos 6 caracteres'; return; }
    this.loading = true;
    try {
      const { error } = await this.authService.updatePassword(this.password);
      if (error) throw error;
      
      this.successMsg = 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.';
      this.password = '';
      this.email = '';
      this.cdr.detectChanges();
      
      // Esperar un momento para que vean el mensaje y luego mandarlos al login limpio
      setTimeout(async () => {
        await this.authService.signOut();
        this.mode = 'login';
        this.successMsg = 'Contraseña actualizada. Ingresa con tus nuevas credenciales.';
        this.cdr.detectChanges();
      }, 2000);

    } catch (err: any) {
      this.errorMsg = err.message || 'Error al actualizar contraseña';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
