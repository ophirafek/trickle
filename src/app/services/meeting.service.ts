import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Meeting } from '../../model/types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/api/meetings`;

  constructor(private http: HttpClient) { }

  // Get all meetings
  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Meeting[]>('getMeetings', []))
      );
  }

  // Get meeting by id
  getMeeting(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Meeting>(`getMeeting id=${id}`))
      );
  }

  // Create new meeting
  createMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(this.apiUrl, meeting)
      .pipe(
        catchError(this.handleError<Meeting>('createMeeting'))
      );
  }

  // Update existing meeting
  updateMeeting(id: number, meeting: Meeting): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, meeting)
      .pipe(
        catchError(this.handleError<any>(`updateMeeting id=${id}`))
      );
  }

  // Delete meeting
  deleteMeeting(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<any>(`deleteMeeting id=${id}`))
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