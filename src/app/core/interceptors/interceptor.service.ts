import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const Interceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    
    const token = isBrowser ? sessionStorage.getItem("authToken") : null;

    const clonedReq = token ? req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    }) : req.clone({
        withCredentials: isBrowser 
    });

    return next(clonedReq).pipe(
        tap(event => {
            if (event instanceof HttpResponse && isBrowser) {
                const newToken = event.headers.get('Authorization') 
                    || event.headers.get('x-auth-token')
                    || null;

                if (newToken) {
                    const tokenValue = newToken.startsWith('Bearer ') ? newToken.substring(7) : newToken;
                    sessionStorage.setItem('authToken', tokenValue);
                }
            }
        }),
        catchError((error: any) => {
            console.error('HTTP Error:', error.status, error.message);
            
            if (error.status === 401) {
                console.warn('Unauthorized');
            }

            if (error.status === 500) {
                console.error('Server error');
            }
            return throwError(() => new Error('An error occurred while processing the request.'));
        })
    );
};
  