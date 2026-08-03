import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '@env/environment';
import { Product, Settings, Table, Staff, Order } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(@Inject(HttpClient) private http: HttpClient) { }

  // Products
  getProductsBySlug(slug: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/${slug}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/my-products`).pipe(timeout(10000));
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // Settings
  getSettingsBySlug(slug: string): Observable<Settings> {
    return this.http.get<Settings>(`${this.apiUrl}/settings/${slug}`);
  }

  getMySettings(): Observable<Settings> {
    return this.http.get<Settings>(`${this.apiUrl}/settings`).pipe(timeout(10000));
  }

  updateSettings(settings: Partial<Settings>): Observable<Settings> {
    return this.http.patch<Settings>(`${this.apiUrl}/settings`, settings);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/uploads`, formData);
  }

  // Master Admin
  getMasterStores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/master/stores`);
  }

  getMasterOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/master/orders`);
  }

  getMasterLeads(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/master/leads`);
  }

  createMasterStore(email: string, password?: string, store_type: string = 'RETAIL'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/create-store`, { email, password, store_type });
  }

  resetMasterStorePassword(userId: string, password?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/reset-password`, { userId, password });
  }

  deleteMasterLead(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/delete-lead`, { id });
  }

  deleteMasterStore(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/delete-store`, { id });
  }

  getPlatformSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/master/platform-settings`);
  }

  updatePlatformSettings(settings: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/platform-settings`, settings);
  }

  toggleMasterFeatured(id: string, is_featured: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/master/toggle-featured`, { id, is_featured });
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/master/audit-logs`);
  }

  // Orders
  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, order);
  }

  getMyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(id: string | number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(orderId: string | number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }

  deleteOrder(orderId: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/orders/${orderId}`);
  }

  getOrderStats(period?: string): Observable<any> {
    const url = period ? `${this.apiUrl}/orders/stats?period=${period}` : `${this.apiUrl}/orders/stats`;
    return this.http.get<any>(url);
  }

  addOrderItems(orderId: string | number, items: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/orders/${orderId}/add-items`, { items });
  }

  deleteOrderItem(orderId: string | number, itemId: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/orders/${orderId}/items/${itemId}`);
  }

  applyDiscount(orderId: string | number, amount: number, reason: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/orders/${orderId}/discount`, { amount, reason });
  }

  // Tables
  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}/tables`);
  }

  createTable(name: string): Observable<Table> {
    return this.http.post<Table>(`${this.apiUrl}/tables`, { name });
  }

  updateTableStatus(tableId: string, status: string, orderId?: string): Observable<Table> {
    return this.http.patch<Table>(`${this.apiUrl}/tables/${tableId}/status`, { status, orderId });
  }

  deleteTable(tableId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tables/${tableId}`);
  }

  // Staff
  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/staff`);
  }

  createStaff(staff: Partial<Staff>): Observable<Staff> {
    return this.http.post<Staff>(`${this.apiUrl}/staff`, staff);
  }

  deleteStaff(staffId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/staff/${staffId}`);
  }
}
