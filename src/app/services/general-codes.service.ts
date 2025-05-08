import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) { }

  // Get general codes by type and language
  getCodesByType(type: number, languageCode: number): Observable<GeneralCode[]> {
    return this.http.get<GeneralCode[]>(`${this.apiUrl}/type/${type}/language/${languageCode}`)
      .pipe(
        catchError(this.handleError<GeneralCode[]>(`getCodesByType type=${type} lang=${languageCode}`, []))
      );
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