import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

export const languageInterceptor : HttpInterceptorFn = (req, next) => {
  const translocoService = inject(TranslocoService);
  const currentLang = translocoService.getActiveLang();
  var langs : Record<string, string> = {'en': 'en-US', 'he': 'he-IL'};
  // Clone the request and add the language header
  const modifiedReq = req.clone({
    headers: req.headers.set('Accept-Language', langs[currentLang])
  });
  
  // Pass the modified request to the next handler
  return next(modifiedReq);

};
/*
@Injectable()
export class LanguageInterceptor implements HttpInterceptor {

  langs : Record<string, string> = {'en': 'en-US', 'he': 'he-IL'}; // Example language mapping
  constructor(private translocoService: TranslocoService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get current language from Transloco
    const currentLang = this.translocoService.getActiveLang();

    // Clone the request and add the language header
    const modifiedReq = req.clone({
      headers: req.headers.set('Accept-Language', this.langs[currentLang])
    });
    
    // Pass the modified request to the next handler
    return next.handle(modifiedReq);
  }
}*/