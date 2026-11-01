import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
<<<<<<< HEAD
import { authInterceptor } from './core/interceptors/auth.interceptor';
=======
import { adminAuthInterceptor } from './core/interceptors/auth.interceptor';
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
<<<<<<< HEAD
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
=======
    provideHttpClient(withFetch(), withInterceptors([adminAuthInterceptor])),
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
    provideClientHydration()
  ]
};
