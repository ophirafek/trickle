import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TranslocoService } from '@ngneat/transloco';

export interface GeneralCode {
  id: number;
  codeType: number;
  codeNumber: number;
  codeShortDescription: string;
  codeLongDescription?: string;
  languageCode: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GeneralCodeService {
  private apiUrl = `${environment.settingsApiUrl}/api/GeneralCodes`;
  
  // Cache for frequently used code types
  private codeCache: { [key: string]: Observable<GeneralCode[]> } = {};

  constructor(
    private http: HttpClient,
    private translocoService: TranslocoService
  ) { }

  // Get general codes by type and language
  getCodesByType(type: number, languageCode = this.translocoService.getActiveLang() == 'he' ? 2:1): Observable<GeneralCode[]> {
    // Create a cache key based on type and language
    const cacheKey = `type_${type}_lang_${languageCode}`;
    
    // Check if we have a cached version of this request
    if (!this.codeCache[cacheKey]) {
      // If not cached, make the HTTP request and cache the result
      this.codeCache[cacheKey] = this.http.get<GeneralCode[]>(`${this.apiUrl}/type/${type}/language/${languageCode}`)
        .pipe(
          catchError(this.handleError<GeneralCode[]>(`getCodesByType type=${type} lang=${languageCode}`, [])),
          // Use shareReplay to cache the result and share it with multiple subscribers
          shareReplay(1)
        );
    }
    
    // Return the cached observable
    return this.codeCache[cacheKey];
  }

  // Get a specific general code
  getCodeByTypeAndNumber(type: number, number: number, languageCode: number): Observable<GeneralCode> {
    return this.http.get<GeneralCode>(`${this.apiUrl}/type/${type}/number/${number}/language/${languageCode}`)
      .pipe(
        catchError(this.handleError<GeneralCode>(`getCodeByTypeAndNumber type=${type} number=${number} lang=${languageCode}`))
      );
  }

  // Helper method to get ID Type Codes (type 10) for the current language
  getIdTypeCodes(languageCode: number): Observable<GeneralCode[]> {
    return this.getCodesByType(10, languageCode);
  }
  
  // Helper method to get Countries (type 21)
  getCountries(languageCode = this.translocoService.getActiveLang() == 'he' ? 2:1): Observable<GeneralCode[]> {
    return this.getCodesByType(21, languageCode);
  }
  
  // Helper method to get Business Fields (type 20)
  getBusinessFields(languageCode = this.translocoService.getActiveLang() == 'he' ? 2:1): Observable<GeneralCode[]> {
    return this.getCodesByType(20, languageCode);
  }
  
  // Helper method to get Entity Types (type 80)
  getEntityTypes(languageCode = this.translocoService.getActiveLang() == 'he' ? 2:1): Observable<GeneralCode[]> {
    return this.getCodesByType(80, languageCode);
  }
  
  // Helper method to get Company Statuses (type 15)
  getCompanyStatuses(languageCode = this.translocoService.getActiveLang() == 'he' ? 2:1): Observable<GeneralCode[]> {
    return this.getCodesByType(15, languageCode);
  }

  // Clear the cache for a specific type or all cache if no type provided
  clearCache(type?: number, languageCode?: number): void {
    if (type !== undefined && languageCode !== undefined) {
      // Clear specific cache entry
      const cacheKey = `type_${type}_lang_${languageCode}`;
      delete this.codeCache[cacheKey];
    } else {
      // Clear all cache
      this.codeCache = {};
    }
  }

  // Error handling method
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}