import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Interceptor } from './core/interceptors/interceptor.service';
import { languageInterceptor } from './services/language-interceptor.service';
import { DefaultTranspiler, provideTransloco, TRANSLOCO_CONFIG, TRANSLOCO_TRANSPILER, translocoConfig } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '../transloco/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay())
    , provideHttpClient(withInterceptors(
      [Interceptor, languageInterceptor]
    ), withFetch()),
     provideTransloco({
      config: {
        availableLangs: ['en', 'he'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),

    {
      provide: TRANSLOCO_TRANSPILER,
      useClass: DefaultTranspiler
    }
  ]
};

