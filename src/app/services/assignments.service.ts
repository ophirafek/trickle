// assignments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Assignment } from '../../model/assignment.model';
import { GeneralCodeService } from './general-codes.service';
import { EmployeeService } from './employee.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  private apiUrl = 'api/assignments';

  constructor(
    private http: HttpClient,
    private generalCodesService: GeneralCodeService,
    private employeesService: EmployeeService,
    private translocoService: TranslocoService
  ) { }
  
  /**
   * Get all assignments for a specific company
   */
  getCompanyAssignments(companyId: number): Observable<Assignment[]> {
    const url = `${this.apiUrl}/company/${companyId}`;
    return this.http.get<Assignment[]>(url).pipe(
      switchMap(assignments => this.enrichAssignmentsWithDetails(assignments)),
      catchError(this.handleError<Assignment[]>(`getCompanyAssignments companyId=${companyId}`, []))
    );
  }
  
  /**
   * Create new assignment
   */
  createAssignment(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment).pipe(
      switchMap(newAssignment => this.enrichAssignmentWithDetails(newAssignment)),
      catchError(this.handleError<Assignment>('createAssignment'))
    );
  }
  
  /**
   * Update an assignment
   */
  updateAssignment(assignment: Assignment): Observable<Assignment> {
    const url = `${this.apiUrl}/${assignment.id}`;
    return this.http.put<Assignment>(url, assignment).pipe(
      switchMap(updatedAssignment => this.enrichAssignmentWithDetails(updatedAssignment)),
      catchError(this.handleError<Assignment>('updateAssignment'))
    );
  }
  
  /**
   * Delete an assignment
   */
  deleteAssignment(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError<any>('deleteAssignment'))
    );
  }
  
  /**
   * Deactivate an assignment (set activeFlag to 0)
   */
  deactivateAssignment(id: number): Observable<Assignment> {
    const url = `${this.apiUrl}/${id}/deactivate`;
    return this.http.put<Assignment>(url, {}).pipe(
      switchMap(updatedAssignment => this.enrichAssignmentWithDetails(updatedAssignment)),
      catchError(this.handleError<Assignment>('deactivateAssignment'))
    );
  }
  
  /**
   * Add display information to assignments
   */
  private enrichAssignmentsWithDetails(assignments: Assignment[]): Observable<Assignment[]> {
    if (assignments.length === 0) {
      return of([]);
    }
    
    // Get all needed code types and employees at once
    return forkJoin({
      assignmentTypes: this.generalCodesService.getCodesByType(90, this.translocoService.getActiveLang() === 'he' ? 2 : 1),
      employees: this.employeesService.getEmployees()
    }).pipe(
      map(({ assignmentTypes, employees }) => {
        return assignments.map(assignment => {
          const enriched = { ...assignment };
          
          // Add assignment type information
          const assignmentType = assignmentTypes.find(t => t.codeNumber === assignment.assignmentTypeCode);
          if (assignmentType) {
            enriched.assignmentTypeName = assignmentType.codeShortDescription;
          }
          
          // Add employee information
          const employee = employees.find(e => e.id === assignment.employeeID);
          if (employee) {
            enriched.employeeName = employee.name;
          }
          
          return enriched;
        });
      })
    );
  }
  
  /**
   * Add display information to a single assignment
   */
  private enrichAssignmentWithDetails(assignment: Assignment): Observable<Assignment> {
    return this.enrichAssignmentsWithDetails([assignment]).pipe(
      map(enrichedAssignments => enrichedAssignments[0])
    );
  }
  
  /**
   * Handle Http operation that failed
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}