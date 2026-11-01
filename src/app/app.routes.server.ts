import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
<<<<<<< HEAD
    path: 'product/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client
  },
  {
    path: 'signup',
    renderMode: RenderMode.Client
  },
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Client
  },
  {
    path: 'contact',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
=======
    path: '**',
    renderMode: RenderMode.Client
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
  }
];
