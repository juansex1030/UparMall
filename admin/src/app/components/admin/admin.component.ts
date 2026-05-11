import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { DataService } from '@shared/services/data.service';
import { AuthService } from '@shared/services/auth.service';
import { Subscription } from 'rxjs';
import { Product, Settings, Order } from '@shared/models/models';

// Sub-components
import { InventoryComponent } from './components/inventory.component';
import { ProductFormComponent } from './components/product-form.component';
import { OrdersComponent } from './components/orders.component';
import { SettingsComponent } from './components/settings.component';
import { MasterControlComponent } from './components/master-control.component';
import { OrderDetailModalComponent } from './components/order-detail-modal.component';
import { AnalyticsComponent } from './components/analytics.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    InventoryComponent,
    ProductFormComponent,
    OrdersComponent,
    SettingsComponent,
    MasterControlComponent,
    OrderDetailModalComponent,
    AnalyticsComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: 'products' | 'settings' | 'master' | 'orders' | 'analytics' = 'products';
  orders: Order[] = [];
  products: Product[] = [];
  categories: string[] = ['Todos'];
  
  settings: Settings | null = null;
  masterStores: any[] = [];
  masterOrders: any[] = [];
  isSuperAdmin = false;
  selectedOrder: any = null;

  private adminEmails = ['juanse1030@gmail.com', 'uparshopelectronics@gmail.com'];
  toast = { visible: false, message: '', isError: false };
  private toastTimer: any;
  private _subs = new Subscription();
  
  isLoading = true;
  isPreviewActive = true;
  showForm = false;
  isSaving = false;
  editingProduct: Product | null = null;
  currentProduct: Partial<Product> = { name: '', price: 0, description: '', imageUrl: '', category: '', variants: [], specifications: [] };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const savedTab = localStorage.getItem('admin_active_tab');
    if (savedTab && ['products', 'settings', 'master', 'orders', 'analytics'].includes(savedTab)) {
      this.activeTab = savedTab as any;
    }

    this._subs.add(this.authService.currentSession$.subscribe(session => {
      if (session) {
        this.checkSuperAdmin(session.user?.email);
        this.loadProducts();
        this.loadSettings();
        if (this.isSuperAdmin) {
          this.loadMasterData();
        }
      } else {
        this.isLoading = false;
      }
    }));
  }

  ngOnDestroy() {
    this._subs.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  setActiveTab(tab: 'products' | 'settings' | 'master' | 'orders' | 'analytics') {
    this.activeTab = tab;
    localStorage.setItem('admin_active_tab', tab);
    
    // Acciones adicionales por pestaña
    if (tab === 'orders') this.loadOrders();
    if (tab === 'master') this.loadMasterData();
    if (tab === 'products' || tab === 'analytics') this.showForm = false;
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
      error: () => this.showToast('Error cargando tiendas globales', true)
    });
    this.dataService.getMasterOrders().subscribe({
      next: (data) => this.masterOrders = data,
      error: () => this.showToast('Error cargando ventas globales', true)
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
  }

  loadSettings() {
    this.dataService.getMySettings().subscribe({
      next: (data) => {
        this.settings = data;
        if (this.settings && !this.settings.socialLinks) {
          this.settings.socialLinks = { instagram: '', facebook: '', tiktok: '' };
        }
        this.updatePreview();
        this.loadOrders();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.showToast('Error de conexión con el servidor', true);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadOrders() {
    this.dataService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders || [];
      },
      error: () => this.showToast('Error al cargar pedidos', true)
    });
  }

  changeStatus(order: Order, newStatus: string) {
    this.dataService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updated) => {
        order.status = updated.status;
        this.orders = [...this.orders]; // Forzar actualización de vista
        this.showToast(`Pedido marcado como ${newStatus.toUpperCase()}`);
        this.cdr.detectChanges();
      },
      error: () => this.showToast('No se pudo cambiar el estado', true)
    });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  openAddForm() {
    this.editingProduct = null;
    this.currentProduct = { name: '', price: 0, description: '', imageUrl: '', category: '', variants: [], specifications: [] };
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.currentProduct = JSON.parse(JSON.stringify(product));
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
  }

  saveProduct() {
    if (this.isSaving) return;
    this.isSaving = true;
    
    const obs = this.editingProduct 
      ? this.dataService.updateProduct(this.editingProduct.id, this.currentProduct)
      : this.dataService.createProduct(this.currentProduct);

    obs.subscribe({
      next: () => {
        this.showToast(this.editingProduct ? 'Producto actualizado' : 'Producto creado');
        this.loadProducts();
        this.closeForm();
        this.isSaving = false;
      },
      error: () => {
        this.showToast('Error al guardar producto', true);
        this.isSaving = false;
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('¿Deseas eliminar este producto?')) {
      this.dataService.deleteProduct(id).subscribe({
        next: (res) => { 
          this.showToast(res.message || 'Producto eliminado correctamente'); 
          this.loadProducts(); 
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.showToast('Error al intentar eliminar el producto', true);
        }
      });
    }
  }

  deleteOrder(order: Order) {
    if (confirm(`¿Deseas eliminar el pedido de ${order.customer_name}?`)) {
      this.dataService.deleteOrder(order.id).subscribe({
        next: () => {
          this.showToast('Pedido eliminado correctamente');
          this.loadOrders();
        },
        error: () => this.showToast('No se pudo eliminar el pedido', true)
      });
    }
  }

  updatePreview() {
    if (this.settings) {
      document.documentElement.style.setProperty('--primary-color', this.settings.primaryColor);
      if (this.settings.fontFamily) document.documentElement.style.setProperty('--font-family', this.settings.fontFamily);
    }
  }

  saveSettings() {
    if (this.settings) {
      this.dataService.updateSettings(this.settings).subscribe({
        next: (s) => { this.settings = s; this.showToast('Cambios guardados'); },
        error: () => this.showToast('Error al guardar', true)
      });
    }
  }

  addSlide() {
    if (!this.settings?.heroSlides) this.settings!.heroSlides = [];
    this.settings!.heroSlides.push({ url: '', title: '' });
  }

  removeSlide(index: number) {
    this.settings?.heroSlides?.splice(index, 1);
  }

  onSlideImageUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => this.settings!.heroSlides![index].url = res.url,
        error: () => this.showToast('Error al subir banner', true)
      });
    }
  }

  onImageUpload(event: any, type: 'logo' | 'background' = 'logo') {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => { if (type === 'logo') this.settings!.logoUrl = res.url; },
        error: () => this.showToast('Error', true)
      });
    }
  }

  onProductImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadImage(file).subscribe({
        next: (res) => this.currentProduct.imageUrl = res.url,
        error: () => this.showToast('Error al subir imagen', true)
      });
    }
  }

  goToMyStore() {
    if (this.settings?.slug) window.open(environment.storeUrl + '/' + this.settings.slug, '_blank');
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  viewStore(slug: string) {
    window.open(environment.storeUrl + '/' + slug, '_blank');
  }

  onPasswordChange(newPassword: string, settingsComp: SettingsComponent) {
    this.authService.updatePassword(newPassword).then(
      ({ error }) => {
        if (error) {
          settingsComp.setPasswordFeedback(error.message, true);
        } else {
          settingsComp.setPasswordFeedback('¡Contraseña actualizada correctamente!', false);
          this.showToast('Contraseña actualizada');
        }
      }
    ).catch(err => {
      settingsComp.setPasswordFeedback('Error al actualizar contraseña', true);
    });
  }
}
