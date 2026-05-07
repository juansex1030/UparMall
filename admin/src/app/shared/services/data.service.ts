import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Settings } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000';

  constructor(@Inject(HttpClient) private http: HttpClient) {}

  // Products
  getProductsBySlug(slug: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/${slug}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/my-products`);
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
    return this.http.get<Settings>(`${this.apiUrl}/settings`);
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
}
