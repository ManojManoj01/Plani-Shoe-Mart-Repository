import { Routes } from '@angular/router';
<<<<<<< HEAD
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ContactComponent } from './pages/contact/contact.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'StepStyle Footwear Store | Palani Shoes'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Footwear & Chappals Collections | StepStyle'
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: 'Product Details | StepStyle'
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard],
    title: 'Shopping Cart & Checkout | StepStyle'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Sign In | StepStyle Footwear'
  },
  {
    path: 'signup',
    component: SignupComponent,
    title: 'Create Account | StepStyle Footwear'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Forgot Password | StepStyle'
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact Store & Directions | Palani Shoes'
  },
  {
    path: '**',
    redirectTo: ''
=======
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
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
  }
];
