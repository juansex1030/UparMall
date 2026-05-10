import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home';
import { authGuard } from '@shared/services/auth.guard';

export const routes: Routes = [
  { path: '', component: AdminComponent, canActivate: [authGuard] },
  { path: 'login', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
