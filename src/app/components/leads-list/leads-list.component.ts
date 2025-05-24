import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Lead, Contact } from '../../../model/types';
import { Employee } from '../../../model/md-types';
import { GeneralCode, GeneralCodeService } from '../../services/general-codes.service';
import { EmployeeService } from '../../services/employee.service';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.css']
})
export class LeadsListComponent implements OnInit, OnChanges {
  @Input() leads: Lead[] = [];
  @Input() loading: boolean = false;
  @Input() companyId: number = 0;
  @Output() leadSelected = new EventEmitter<Lead>();
  @Output() addLeadClicked = new EventEmitter<void>();
  @Output() leadDeleted = new EventEmitter<number>();

  // Table configuration
  displayedColumns: string[] = [
    'leadId', 
    'leadName', 
    'leadType', 
    'leadStatus', 
    'salesGapValue', 
    'probability', 
    'market', 
    'contactName', 
    'owner', 
    'actions'
  ];

  // General codes
  leadTypes: GeneralCode[] = [];
  leadStatuses: GeneralCode[] = [];
  markets: GeneralCode[] = [];

  // Reference data
  employees: Employee[] = [];
  contacts: Contact[] = [];

  // Error handling
  errorMessage: string | null = null;

  constructor(
    private generalCodeService: GeneralCodeService,
    private employeeService: EmployeeService,
    private companyService: CompanyService,
    private leadService: LeadService,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId'] && this.companyId) {
      this.loadCompanyContacts();
    }
  }

  /**
   * Load all reference data needed for the table
   */
  loadReferenceData(): void {
    const requests = {
      leadTypes: this.generalCodeService.getCodesByType(50),
      leadStatuses: this.generalCodeService.getCodesByType(70),
      markets: this.generalCodeService.getCodesByType(75),
      employees: this.employeeService.getEmployees()
    };

    forkJoin(requests)
      .pipe(
        finalize(() => {
          // Load company contacts if companyId is available
          if (this.companyId) {
            this.loadCompanyContacts();
          }
        })
      )
      .subscribe({
        next: ({ leadTypes, leadStatuses, markets, employees }) => {
          this.leadTypes = leadTypes;
          this.leadStatuses = leadStatuses;
          this.markets = markets;
          this.employees = employees;
        },
        error: (error) => {
          console.error('Error loading reference data:', error);
          this.errorMessage = 'Failed to load reference data';
        }
      });
  }

  /**
   * Load contacts for the current company
   */
  loadCompanyContacts(): void {
    if (!this.companyId) return;

    this.companyService.getCompanyContacts(this.companyId)
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
        },
        error: (error) => {
          console.error('Error loading company contacts:', error);
        }
      });
  }

  /**
   * Get lead type name from code
   */
  getLeadTypeName(code?: number): string {
    if (!code) return '';
    const leadType = this.leadTypes.find(t => t.codeNumber === code);
    return leadType?.codeShortDescription || '';
  }

  /**
   * Get lead status name from code
   */
  getLeadStatusName(statusCode?: string): string {
    if (!statusCode) return '';
    // Assuming statusCode is stored as string but maps to codeNumber
    const numericCode = parseInt(statusCode, 10);
    if (isNaN(numericCode)) return statusCode; // Return as-is if not numeric
    
    const status = this.leadStatuses.find(s => s.codeNumber === numericCode);
    return status?.codeShortDescription || statusCode;
  }

  /**
   * Get market name from code
   */
  getMarketName(code?: number): string {
    if (!code) return '';
    const market = this.markets.find(m => m.codeNumber === code);
    return market?.codeShortDescription || '';
  }

  /**
   * Get contact name from contact ID
   */
  getContactName(contactId?: number): string {
    if (!contactId) return '';
    const contact = this.contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}`.trim() : '';
  }

  /**
   * Get owner name from employee ID
   */
  getOwnerName(employeeId?: number): string {
    if (!employeeId) return '';
    const employee = this.employees.find(e => e.id === employeeId);
    return employee?.name || '';
  }

  /**
   * Get CSS class for status chip based on status
   */
  getStatusChipClass(statusCode?: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    // Map common status codes to colors
    const statusColorMap: { [key: string]: string } = {
      'new': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'qualified': 'bg-yellow-100 text-yellow-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'closed': 'bg-gray-100 text-gray-800',
      'won': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800'
    };

    const statusKey = statusCode?.toLowerCase() || '';
    const colorClass = statusColorMap[statusKey] || 'bg-gray-100 text-gray-800';
    
    return `${baseClasses} ${colorClass}`;
  }

  /**
   * Handle add lead button click
   */
  addLead(): void {
    this.addLeadClicked.emit();
  }

  /**
   * Handle edit lead
   */
  editLead(lead: Lead): void {
    this.leadSelected.emit(lead);
  }

  /**
   * Handle delete lead
   */
  deleteLead(leadId?: number): void {
    if (!leadId) return;

    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
      this.leadService.deleteLead(leadId)
        .subscribe({
          next: () => {
            this.leadDeleted.emit(leadId);
            this.snackBar.open(
              'Lead deleted successfully',
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          },
          error: (error) => {
            console.error('Error deleting lead:', error);
            this.snackBar.open(
              'Failed to delete lead',
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
        });
    }
  }
}