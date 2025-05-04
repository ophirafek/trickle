import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Employee } from '../../model/md-types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.employeeApiUrl}/api/Employees`;

  constructor(private http: HttpClient) { }

  // Get all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        map(employees => this.mapEmployeeDtoToModel(employees)),
        catchError(this.handleError<Employee[]>('getEmployees', []))
      );
  }

  // Get employee by id
  getEmployeeById(id: number): Observable<Employee | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(employee => this.mapEmployeeDtoToEmployee(employee)),
        catchError(this.handleError<Employee>(`getEmployeeById id=${id}`))
      );
  }

  // Check if employee exists by employeeId
  employeeExists(employeeId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${employeeId}`)
      .pipe(
        catchError(this.handleError<boolean>('employeeExists', false))
      );
  }

  // Get employee by employeeId
  getEmployeeByEmployeeId(employeeId: string): Observable<Employee | undefined> {
    return this.http.get<any>(`${this.apiUrl}/byemployeeid/${employeeId}`)
      .pipe(
        map(employee => this.mapEmployeeDtoToEmployee(employee)),
        catchError(this.handleError<Employee>(`getEmployeeByEmployeeId employeeId=${employeeId}`))
      );
  }

  // Helper method to map DTO to our model
  private mapEmployeeDtoToModel(employeeDtos: any[]): Employee[] {
    return employeeDtos.map(dto => this.mapEmployeeDtoToEmployee(dto));
  }

  private mapEmployeeDtoToEmployee(dto: any): Employee {
    return {
      id: dto.userId,
      name: dto.employeeName || '',
      department: dto.department || 'General', // Default value if not provided
      position: dto.position || 'Employee', // Default value if not provided
      email: dto.email || '',
      phone: dto.phoneNumber || '',
      employeeId: dto.employeeId || '',
      // Additional properties from DTO that we might want to keep
      activeFlag: dto.activeFlag,
      openingEffectiveDate: dto.openingEffectiveDate,
      closingEffectiveDate: dto.closingEffectiveDate
    };
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