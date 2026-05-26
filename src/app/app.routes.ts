import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminMenuComponent } from './pages/admin-menu/admin-menu';
import { CustomerMenuComponent } from './pages/customer-menu/customer-menu';
import { LoginComponent } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'customer/menu', component: CustomerMenuComponent },
  { path: 'admin/menu', component: AdminMenuComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: '**', redirectTo: 'login' }
];
