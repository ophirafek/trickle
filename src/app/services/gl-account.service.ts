// gl-account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GLAccount } from '../../model/gl-account.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GLAccountService {
  private apiUrl = `${environment.apiUrl}/api/glaccounts`;

  constructor(private http: HttpClient) { }

  // Get all GL accounts for a company
  getCompanyGLAccounts(companyId: number): Observable<GLAccount[]> {
    return this.http.get<GLAccount[]>(`${this.apiUrl}/company/${companyId}`)
      .pipe(
        catchError(this.handleError<GLAccount[]>(`getCompanyGLAccounts companyId=${companyId}`, []))
      );
  }

  // Get GL account by id
  getGLAccount(id: number): Observable<GLAccount> {
    return this.http.get<GLAccount>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<GLAccount>(`getGLAccount id=${id}`))
      );
  }

  // Create new GL account
  createGLAccount(glAccount: GLAccount): Observable<GLAccount> {
    return this.http.post<GLAccount>(this.apiUrl, glAccount)
      .pipe(
        catchError(this.handleError<GLAccount>('createGLAccount'))
      );
  }

  // Update existing GL account
  updateGLAccount(id: number, glAccount: GLAccount): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, glAccount)
      .pipe(
        catchError(this.handleError<any>(`updateGLAccount id=${id}`))
      );
  }

  // Delete GL account
  deleteGLAccount(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<any>(`deleteGLAccount id=${id}`))
      );
  }

  // Deactivate GL account (set activeFlag to false)
  deactivateGLAccount(id: number): Observable<GLAccount> {
    const url = `${this.apiUrl}/${id}/deactivate`;
    return this.http.put<GLAccount>(url, {})
      .pipe(
        catchError(this.handleError<GLAccount>('deactivateGLAccount'))
      );
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