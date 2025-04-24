import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from '../../model/types';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    { id: 1, name: 'John Smith', department: 'Sales', position: 'Sales Manager' },
    { id: 2, name: 'Sarah Johnson', department: 'Sales', position: 'Sales Representative' },
    { id: 3, name: 'Michael Chen', department: 'Sales', position: 'Account Executive' },
    { id: 4, name: 'Emily Davis', department: 'Marketing', position: 'Marketing Specialist' },
    { id: 5, name: 'David Wilson', department: 'Support', position: 'Customer Support Specialist' },
    { id: 6, name: 'Jessica Brown', department: 'Finance', position: 'Financial Analyst' },
    { id: 7, name: 'Robert Martinez', department: 'IT', position: 'IT Administrator' },
    { id: 8, name: 'Lisa Taylor', department: 'Legal', position: 'Legal Counsel' }
  ];

  constructor() { }

  getEmployees(): Observable<Employee[]> {
    // Simulate API call with delayed response
    return of(this.employees);
  }

  getEmployeeById(id: number): Observable<Employee | undefined> {
    const employee = this.employees.find(emp => emp.id === id);
    return of(employee);
  }
}