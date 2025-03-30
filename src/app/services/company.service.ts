import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Company, Contact, Note } from '../../model/types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/api/companies`;

  constructor(private http: HttpClient) { }

  // Get all companies
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Company[]>('getCompanies', []))
      );
  }

  // Get company by id
  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Company>(`getCompany id=${id}`))
      );
  }

  // Create new company
  createCompany(company: Company): Observable<Company> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    const options = { headers: headers };
    
    // Clean and stringify the object
    const jsonString = JSON.stringify(company);
    
    return this.http.post<Company>(this.apiUrl, jsonString, options)
      .pipe(
        catchError(this.handleError<Company>('createCompany'))
      );
  }

  // Update existing company
  updateCompany(id: number, company: Company): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, company)
      .pipe(
        catchError(this.handleError<any>(`updateCompany id=${id}`))
      );
  }

  // Delete company
  deleteCompany(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<any>(`deleteCompany id=${id}`))
      );
  }

  // Add contact to company
  addContact(companyId: number, contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(`${this.apiUrl}/${companyId}/contacts`, contact)
      .pipe(
        catchError(this.handleError<Contact>('addContact'))
      );
  }

  // Add note to company
  addNote(companyId: number, note: Note): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/${companyId}/notes`, note)
      .pipe(
        catchError(this.handleError<Note>('addNote'))
      );
  }

  // Update contact
  updateContact(id: number, contact: Contact): Observable<any> {
    return this.http.put<void>(`${environment.apiUrl}/api/contacts/${id}`, contact)
      .pipe(
        catchError(this.handleError<any>(`updateContact id=${id}`))
      );
  }

  // Delete contact
  deleteContact(id: number): Observable<any> {
    return this.http.delete<void>(`${environment.apiUrl}/api/contacts/${id}`)
      .pipe(
        catchError(this.handleError<any>(`deleteContact id=${id}`))
      );
  }

  // Update note
  updateNote(id: number, note: Note): Observable<any> {
    return this.http.put<void>(`${environment.apiUrl}/api/notes/${id}`, note)
      .pipe(
        catchError(this.handleError<any>(`updateNote id=${id}`))
      );
  }

  // Delete note
  deleteNote(id: number): Observable<any> {
    return this.http.delete<void>(`${environment.apiUrl}/api/notes/${id}`)
      .pipe(
        catchError(this.handleError<any>(`deleteNote id=${id}`))
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