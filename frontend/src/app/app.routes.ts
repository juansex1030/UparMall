import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog';
import { CartComponent } from './components/cart/cart';
import { LandingComponent } from './components/landing/landing';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: ':slug', component: CatalogComponent },
  { path: ':slug/cart', component: CartComponent },
  { path: '**', redirectTo: 'uparshop' }
];
