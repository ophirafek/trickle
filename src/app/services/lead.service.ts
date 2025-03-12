import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Lead } from '../../model/types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/api/leads`;

  constructor(private http: HttpClient) { }

  // Get all leads
  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Lead[]>('getLeads', []))
      );
  }

  // Get lead by id
  getLead(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Lead>(`getLead id=${id}`))
      );
  }

  // Create new lead
  createLead(lead: Lead): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead)
      .pipe(
        catchError(this.handleError<Lead>('createLead'))
      );
  }

  // Update existing lead
  updateLead(id: number, lead: Lead): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, lead)
      .pipe(
        catchError(this.handleError<any>(`updateLead id=${id}`))
      );
  }

  // Delete lead
  deleteLead(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<any>(`deleteLead id=${id}`))
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