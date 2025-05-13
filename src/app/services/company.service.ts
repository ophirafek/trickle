// src/app/services/company.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Company, Contact, Note, ImportResult, Account, Lead } from '../../model/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/api/companies`;
  private selectedCompanySubject = new BehaviorSubject<Company | null>(null);
  selectedCompany$ = this.selectedCompanySubject.asObservable();
  private contactsSubject = new BehaviorSubject<Contact[]>([
    { id: 1, firstName: 'John', lastName: 'Smith', role: 'CEO', belongsTo: 'insured', telephone: '123-456-7890', mobile: '098-765-4321', email: 'john.smith@company.com' },
    { id: 2, firstName: 'Sarah', lastName: 'Johnson', role: 'CFO', belongsTo: 'insured', telephone: '123-555-7777', mobile: '098-555-8888', email: 'sarah.j@company.com' }
  ]);
  contacts$ = this.contactsSubject.asObservable();

  private accountsSubject = new BehaviorSubject<Account[]>([
    { id: 1, accountNumber: 'ACC-10023-XY', accountType: 'Business', status: 'Active' },
    { id: 2, accountNumber: 'ACC-10045-XY', accountType: 'Corporate', status: 'Active' }
  ]);
  accounts$ = this.accountsSubject.asObservable();
  private leadsSubject = new BehaviorSubject<Lead[]>([
    { 
      id: 1, 
      companyId: 1,
      leadName: 'Enterprise Software Solution', 
      leadTypeCode: 1,
      status: 'Open',
      salesGapValue: 75000, 
      probability: 60,
      contactName: 'John Smith',
      owner: 'David Wilson',
      source: 'Local + Export'
    },
    { 
      id: 2, 
      leadName: 'Annual Support Contract', 
      leadTypeCode: 1,
      status: 'In Progress',
      salesGapValue: 75000, 
      probability: 75,
      contactName: 'Sarah Johnson',
      owner: 'Lisa Chen',
      source: 'Local'
    },
    { 
      id: 3, 
      leadName: 'Hardware Upgrade Project', 
      leadTypeCode: 1,
      status: 'Closed',
      salesGapValue: 75000, 
      probability: 100,
      contactName: 'John Smith',
      owner: 'Robert Johnson',
      source: 'Export'
    }
  ]);
  leads$ = this.leadsSubject.asObservable();
  constructor(private http: HttpClient) {
   }
  setSelectedCompany(company: Company): void {
    this.selectedCompanySubject.next(company);
  }

  getSelectedCompany(): Observable<Company | null> {
    return this.selectedCompany$;
  }
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
  
  importCompanies(companies: Company[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/import`, companies)
      .pipe(
        catchError(this.handleError<any>('importCompanies'))
      );
  }

  importSingleCompany(company: Company): Observable<ImportResult> {
    return this.importCompanies([company]).pipe(
      map(results => results[0]), // Take the first result
      catchError(error => {
        console.error('Error importing company:', error);
        // Return a formatted error response
        return of({
          status: 3,
          companyName: company.registrationName,
          errorMessage: 'Network or server error occurred'
        });
      })
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

  getContacts(): Observable<Contact[]>  {
    return this.contacts$;
  }

  getAccounts(): Observable<Account[]> {
    return this.accounts$;
  }

  // Account methods
  addAccount(account: Account): void {
    const accounts = this.accountsSubject.value;
    account.id = 0;
    this.accountsSubject.next([...accounts, account]);
  }

  updateAccount(account: Account): void {
    const accounts = this.accountsSubject.value;
    const index = accounts.findIndex(a => a.id === account.id);
    if (index !== -1) {
      accounts[index] = account;
      this.accountsSubject.next([...accounts]);
    }
  }

  deleteAccount(id: number): void {
    const accounts = this.accountsSubject.value;
    this.accountsSubject.next(accounts.filter(a => a.id !== id));
  }
  getLeads(): Observable<Lead[]> {
    return this.leads$;
  }
    // Lead methods
    addLead(lead: Lead): void {
      const leads = this.leadsSubject.value;
      lead.id = 0;
      this.leadsSubject.next([...leads, lead]);
    }
  
    updateLead(lead: Lead): void {
      const leads = this.leadsSubject.value;
      const index = leads.findIndex(l => l.id === lead.id);
      if (index !== -1) {
        leads[index] = lead;
        this.leadsSubject.next([...leads]);
      }
    }
  
    deleteLead(id: number): void {
      const leads = this.leadsSubject.value;
      this.leadsSubject.next(leads.filter(l => l.id !== id));
    }
}