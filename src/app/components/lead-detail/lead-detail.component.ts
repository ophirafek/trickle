import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lead, Company, Contact } from '../../../model/types';
import { Employee } from '../../../model/md-types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { GeneralCodeService, GeneralCode } from '../../services/general-codes.service';
import { EmployeeService } from '../../services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-lead-detail',
    templateUrl: './lead-detail.component.html',
    styleUrls: ['./lead-detail.component.css'],
    standalone: false
})
export class LeadDetailComponent implements OnInit {
  editingLead: Lead = this.getEmptyLead();
  isNewLead: boolean = true;
  
  // Reference data
  companies: Company[] = [];
  leadTypes: GeneralCode[] = [];
  leadStatuses: GeneralCode[] = [];
  markets: GeneralCode[] = [];
  currencies: GeneralCode[] = [];
  employees: Employee[] = [];
  companyContacts: Contact[] = [];
  
  // UI state
  loading: boolean = false;
  saving: boolean = false;
  error: string | null = null;
  
  // Query parameters for pre-filled data
  preSelectedCompanyId: number | null = null;
  preSelectedCompanyName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private leadService: LeadService,
    private generalCodeService: GeneralCodeService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    
    // Check route parameters and query parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id && id !== 'new') {
        // Editing existing lead
        this.isNewLead = false;
        this.loadLead(parseInt(id, 10));
      } else {
        // Creating new lead
        this.isNewLead = true;
        this.editingLead = this.getEmptyLead();
        
        // Check for query parameters (company pre-selection)
        this.route.queryParams.subscribe(queryParams => {
          this.preSelectedCompanyId = queryParams['companyId'] ? parseInt(queryParams['companyId'], 10) : null;
          this.preSelectedCompanyName = queryParams['companyName'] || null;
          
          if (this.preSelectedCompanyId) {
            this.editingLead.companyId = this.preSelectedCompanyId;
            this.editingLead.companyName = this.preSelectedCompanyName || '';
          }
        });
      }
    });
    
    // Load reference data
    this.loadReferenceData();
  }

  loadLead(id: number): void {
    this.leadService.getLead(id).subscribe({
      next: (lead) => {
        this.editingLead = lead;
        // Load contacts for the lead's company
        if (lead.companyId) {
          this.loadCompanyContacts(lead.companyId);
        }
      },
      error: (err) => {
        this.error = 'Failed to load lead details';
        console.error('Error loading lead:', err);
        this.loading = false;
      }
    });
  }

  loadReferenceData(): void {
    const requests = {
      companies: this.companyService.getCompanies(),
      leadTypes: this.generalCodeService.getCodesByType(50),
      leadStatuses: this.generalCodeService.getCodesByType(70),
      markets: this.generalCodeService.getCodesByType(75),
      currencies: this.generalCodeService.getCodesByType(26),
      employees: this.employeeService.getEmployees()
    };

    forkJoin(requests)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ({ companies, leadTypes, leadStatuses, markets, currencies, employees }) => {
          this.companies = companies;
          this.leadTypes = leadTypes;
          this.leadStatuses = leadStatuses;
          this.markets = markets;
          this.currencies = currencies;
          this.employees = employees;
          
          // Load contacts for pre-selected company
          if (this.editingLead.companyId) {
            this.loadCompanyContacts(this.editingLead.companyId);
          }
        },
        error: (error) => {
          this.error = 'Failed to load reference data';
          console.error('Error loading reference data:', error);
        }
      });
  }

  loadCompanyContacts(companyId: number): void {
    if (!companyId) {
      this.companyContacts = [];
      return;
    }

    this.companyService.getCompanyContacts(companyId).subscribe({
      next: (contacts) => {
        this.companyContacts = contacts;
      },
      error: (error) => {
        console.error('Error loading company contacts:', error);
        this.companyContacts = [];
      }
    });
  }

  onCompanyChange(): void {
    // Load contacts when company changes
    this.loadCompanyContacts(this.editingLead.companyId);
    
    // Update company name
    const selectedCompany = this.companies.find(c => c.id === this.editingLead.companyId);
    if (selectedCompany) {
      this.editingLead.companyName = selectedCompany.registrationName;
    }
    
    // Reset contact selection
    this.editingLead.contactId = 0;
  }

  getEmptyLead(): Lead {
    return {
      leadId: 0,
      leadName: '',
      companyId: this.preSelectedCompanyId || 0,
      leadTypeCode: 0,
      leadSourceCode: 0,
      contactId: 0,
      currencyCode: 0,
      marketCode: 0,
      agentId: 0,
      ownerEmployeeId: 0,
      probability: 50, // Default to 50%
      score: 0,
      employees: 0,
      actualSalesValue: 0,
      salesGapValue: 0,
      activityExpansion: '',
      exportMarketValue: 0,
      localMarketValue: 0,
      exportRatio: 0,
      region: '',
      currentInsurerNo: '',
      externalStartDate: new Date(),
      statusCode: 1, // Default to "New" status
      reasonRejectionCode: 0,
      rejectionDetail: '',
      notes: '',
      additionalInfo: '',
      openingEffectiveDate: new Date(),
      closingEffectiveDate: undefined,
      openingRegistrationDate: new Date(),
      closingRegistrationDate: undefined,
      openingReference: 0,
      closingReference: 0,
      activeFlag: true,
      // Computed properties
      leadTypeName: '',
      leadStatusName: 'New',
      marketName: '',
      contactName: '',
      ownerName: '',
      companyName: this.preSelectedCompanyName || ''
    };
  }

  isValid(): boolean {
    return !!(
      this.editingLead.leadName?.trim() && 
      this.editingLead.companyId &&
      this.editingLead.probability >= 0 && 
      this.editingLead.probability <= 100
    );
  }

  save(): void {
    if (!this.isValid()) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.saving = true;
    this.error = null;

    if (this.isNewLead) {
      // Create new lead
      this.leadService.createLead(this.editingLead).subscribe({
        next: (createdLead) => {
          this.saving = false;
          this.snackBar.open(
            this.translocoService.translate('LEADS.CREATE_SUCCESS') || 'Lead created successfully',
            this.translocoService.translate('BUTTONS.CLOSE') || 'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          
          // Navigate back to the appropriate page
          if (this.preSelectedCompanyId) {
            // Navigate back to company detail with leads tab
            this.router.navigate(['/companies', this.preSelectedCompanyId], { 
              queryParams: { tab: 'leads' } 
            });
          } else {
            // Navigate to leads list
            this.router.navigate(['/leads']);
          }
        },
        error: (err) => {
          this.saving = false;
          this.error = 'Failed to create lead. Please try again.';
          console.error('Error creating lead:', err);
          
          this.snackBar.open(
            this.translocoService.translate('LEADS.CREATE_ERROR') || 'Failed to create lead',
            this.translocoService.translate('BUTTONS.CLOSE') || 'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
    } else {
      // Update existing lead
      this.leadService.updateLead(this.editingLead.leadId || 0, this.editingLead).subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open(
            this.translocoService.translate('LEADS.UPDATE_SUCCESS') || 'Lead updated successfully',
            this.translocoService.translate('BUTTONS.CLOSE') || 'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          
          // Navigate back to leads list
          this.router.navigate(['/leads']);
        },
        error: (err) => {
          this.saving = false;
          this.error = 'Failed to update lead. Please try again.';
          console.error('Error updating lead:', err);
          
          this.snackBar.open(
            this.translocoService.translate('LEADS.UPDATE_ERROR') || 'Failed to update lead',
            this.translocoService.translate('BUTTONS.CLOSE') || 'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  cancel(): void {
    // Navigate back to the appropriate page
    if (this.preSelectedCompanyId) {
      // Navigate back to company detail with leads tab
      this.router.navigate(['/companies', this.preSelectedCompanyId], { 
        queryParams: { tab: 'leads' } 
      });
    } else {
      // Navigate to leads list
      this.router.navigate(['/leads']);
    }
  }

  navigateBack(): void {
    this.cancel();
  }

  /**
   * Get the symbol/short name of the selected currency
   */
  getSelectedCurrencySymbol(): string {
    if (!this.editingLead.currencyCode || this.editingLead.currencyCode === 0) 
      return 'NIS';
    
    const selectedCurrency = this.currencies.find(c => c.codeNumber === this.editingLead.currencyCode);
    return selectedCurrency ? selectedCurrency.codeShortDescription : 'NIS';
  }
}
