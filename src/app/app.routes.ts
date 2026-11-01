import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { TestComponent } from './pages/test/test.component';
import { adminAuthGuard, adminLoginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [adminLoginGuard],
    title: 'Admin Sign In | StepStyle'
  },
  {
    path: 'test',
    component: TestComponent,
    title: 'Backend API Health Test | StepStyle'
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard | StepStyle Admin'
      },
      {
        path: 'products',
        component: ProductListComponent,
        title: 'Manage Products | StepStyle Admin'
      },
      {
        path: 'products/add',
        component: ProductFormComponent,
        title: 'Add New Footwear | StepStyle Admin'
      },
      {
        path: 'products/edit/:id',
        component: ProductFormComponent,
        title: 'Edit Footwear | StepStyle Admin'
      },
      {
        path: 'categories',
        component: CategoriesComponent,
        title: 'Manage Categories | StepStyle Admin'
      },
      {
        path: 'orders',
        component: OrdersComponent,
        title: 'Customer Orders | StepStyle Admin'
      },
      {
        path: 'test',
        component: TestComponent,
        title: 'Backend API Health Test | StepStyle Admin'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
