import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog';
import { AdminComponent } from './components/admin/admin';
import { CartComponent } from './components/cart/cart';
import { HomeComponent } from './components/home/home';
import { LandingComponent } from './components/landing/landing';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'admin/login', component: HomeComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: ':slug', component: CatalogComponent },
  { path: ':slug/cart', component: CartComponent },
  { path: '**', redirectTo: 'uparshop' }
];
