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
          <img src="/assets/logo-uparmall.png" alt="UparMall Logo" style="width: 80px; height: 80px; margin-bottom: 15px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: white; padding: 8px; object-fit: contain;">
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
      background: #050505;
      padding: 20px;
      color: #ffffff;
      font-family: 'Inter', sans-serif;
    }
    .glass-panel {
      background: #0a0a0a;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      border: 1px solid #222222;
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
    }
    .brand { text-align: center; margin-bottom: 30px; }
    .brand h1 { color: #ffffff; margin: 0 0 10px 0; font-size: 2rem; font-weight: 900; letter-spacing: -1px; }
    .brand p { color: #cccccc; margin: 0; }
    
    form {
      animation: formEnter 300ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }
    @keyframes formEnter {
      from { opacity: 0; transform: scale(0.95); filter: blur(4px); }
      to { opacity: 1; transform: scale(1); filter: blur(0); }
    }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #cccccc; font-size: 0.9rem; }
    .form-group input { width: 100%; padding: 12px 15px; background: #111111; color: #ffffff; border: 1px solid #333333; border-radius: 8px; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
    .form-group input:focus { border-color: #ffffff; outline: none; }
    
    .submit-btn { 
      width: 100%; background: #ffffff; color: #000000; padding: 14px; border: none; border-radius: 8px; 
      font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 10px; 
      transition: background 160ms cubic-bezier(0.23, 1, 0.32, 1), transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    }
    .submit-btn:hover:not(:disabled) { background: #eeeeee; }
    .submit-btn:active:not(:disabled) { transform: scale(0.97); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .cancel-btn { 
      width: 100%; background: transparent; color: #cccccc; padding: 14px; border: 1px solid #333333; 
      border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 10px; 
      transition: background 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1); 
    }
    .cancel-btn:hover { background: #111111; color: #ffffff; }
    .cancel-btn:active { transform: scale(0.97); }
    
    .forgot-link { 
      background: transparent; border: none; color: #cccccc; padding: 0; font-size: 0.85rem; 
      cursor: pointer; margin-bottom: 15px; text-decoration: underline; 
      transition: color 160ms ease; 
    }
    .forgot-link:hover { color: #ffffff; }
    .hint { font-size: 0.85rem; color: #aaaaaa; text-align: center; margin-top: 15px; line-height: 1.4; }
    .msg { padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; }
    .msg.error { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); }
    .msg.success { background: rgba(39, 174, 96, 0.1); color: #27ae60; border: 1px solid rgba(39, 174, 96, 0.2); }
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

    this._authSub = this.authService.authEvent$.subscribe(event => {
      if (event === 'PASSWORD_RECOVERY') this.setMode('update-password');
      this.cdr.detectChanges();
    });
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
  ) {}

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
