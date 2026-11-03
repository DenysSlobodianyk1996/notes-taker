import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '@env/environment';
import { routes } from './app.routes';
import { AnalyticsService, CLARITY_PROJECT_ID } from '@core/analytics/analytics.service';
import { AuthService } from '@core/auth/auth.service';
import { provideFirebase } from '@core/firebase/firebase';
import { UiLanguageService } from '@core/i18n/ui-language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    }),
    provideFirebase(environment.firebase),
    provideAppInitializer(() => inject(UiLanguageService).init()),
    // UX analytics (ADR-0011): production only, through the production environment's project id.
    { provide: CLARITY_PROJECT_ID, useValue: environment.clarityProjectId },
    provideAppInitializer(() => inject(AnalyticsService).start()),
    // Guards need the real sign-in state (and any finished redirect) before the first route.
    provideAppInitializer(() => inject(AuthService).ready()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
