import { Routes } from '@angular/router';
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
  }
];
