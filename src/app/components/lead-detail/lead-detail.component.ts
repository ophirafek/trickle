import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lead, Company, Contact } from '../../../model/types';
import { Employee } from '../../../model/md-types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { GeneralCodeService, GeneralCode } from '../../services/general-codes.service';
import { EmployeeService } from '../../services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { GeneralCodeSelectComponent } from '../general/general-code-select/general-code-select.component';
import { CustomFieldsContainerComponent } from '../general/custom-fields-container/custom-fields-container.component';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.css']
})
export class LeadDetailComponent implements OnInit {
  editingLead: Lead = this.getEmptyLead();
  isNewLead: boolean = true;
  leadForm: FormGroup;
  
  @ViewChild(CustomFieldsContainerComponent) customFieldsContainer!: CustomFieldsContainerComponent;
  
  // Reference data
  companies: Company[] = [];
  leadTypes: GeneralCode[] = [];
  leadSources: GeneralCode[] = []; // Added for lead sources
  leadStatuses: GeneralCode[] = [];
  markets: GeneralCode[] = [];
  currencies: GeneralCode[] = [];
  rejectionReasons: GeneralCode[] = []; // Added for rejection reasons
  employees: Employee[] = [];
  companyContacts: Contact[] = [];
  
  // UI state
  loading: boolean = false;
  saving: boolean = false;
  error: string | null = null;
  activeTab: 'basic' | 'financial' | 'meetings' | 'notes' | 'customFields' = 'basic';
  
  // Constants
  rejectionStatusCode: number = 3; // Assuming 3 is "Rejected" status code, adjust as needed
  
  // Query parameters for pre-filled data
  preSelectedCompanyId: number | null = null;
  preSelectedCompanyName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private leadService: LeadService,
    private generalCodeService: GeneralCodeService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService
  ) {
    // Initialize form
    this.leadForm = this.fb.group({
      leadId: [0],
      leadName: ['', Validators.required],
      companyId: [0, Validators.required],
      companyName: [''],
      leadTypeCode: [0],
      leadSourceCode: [0],
      contactId: [0],
      currencyCode: [0],
      marketCode: [0],
      agentId: [0],
      ownerEmployeeId: [0],
      probability: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      score: [0],
      employees: [0],
      actualSalesValue: [0],
      salesGapValue: [0],
      activityExpansion: [''],
      exportMarketValue: [0],
      localMarketValue: [0],
      exportRatio: [0],
      region: [''],
      currentInsurerNo: [''],
      externalStartDate: [new Date()],
      statusCode: [1],
      reasonRejectionCode: [0],
      rejectionDetail: [''],
      notes: [''],
      additionalInfo: [''],
      openingEffectiveDate: [new Date()],
      closingEffectiveDate: [null],
      openingRegistrationDate: [new Date()],
      closingRegistrationDate: [null],
      openingReference: [0],
      closingReference: [0],
      activeFlag: [true],
      // Custom fields will be added dynamically
    });
  }

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
            this.leadForm.patchValue({
              companyId: this.preSelectedCompanyId,
              companyName: this.preSelectedCompanyName || ''
            });
          }
        });

        // Update form values from empty lead
        this.updateFormFromLead(this.editingLead);
        this.loading = false;
      }
    });
    
    // Load reference data
    this.loadReferenceData();
  }

  loadLead(id: number): void {
    this.leadService.getLead(id).subscribe({
      next: (lead) => {
        this.editingLead = lead;
        // Update form values from lead
        this.updateFormFromLead(lead);
        
        // Load contacts for the lead's company
        if (lead.companyId) {
          this.loadCompanyContacts(lead.companyId);
        }
        
        this.loading = false;
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
      leadSources: this.generalCodeService.getCodesByType(65), // Assuming 65 is lead source code type
      leadStatuses: this.generalCodeService.getCodesByType(70),
      markets: this.generalCodeService.getCodesByType(75),
      currencies: this.generalCodeService.getCodesByType(26),
      rejectionReasons: this.generalCodeService.getCodesByType(65), // Added rejection reasons from code 65
      employees: this.employeeService.getEmployees()
    };

    forkJoin(requests)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.companies = response.companies;
          this.leadTypes = response.leadTypes;
          this.leadSources = response.leadSources;
          this.leadStatuses = response.leadStatuses;
          this.markets = response.markets;
          this.currencies = response.currencies;
          this.rejectionReasons = response.rejectionReasons;
          this.employees = response.employees;
          
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
    // Get companyId from form
    const companyId = this.leadForm.get('companyId')?.value;
    
    // Load contacts when company changes
    this.loadCompanyContacts(companyId);
    
    // Update company name
    const selectedCompany = this.companies.find(c => c.id === companyId);
    if (selectedCompany) {
      this.leadForm.patchValue({
        companyName: selectedCompany.registrationName
      });
    }
    
    // Reset contact selection
    this.leadForm.patchValue({
      contactId: 0
    });
  }

  // Update form values from lead object
  updateFormFromLead(lead: Lead): void {
    this.leadForm.patchValue({
      leadId: lead.leadId || 0,
      leadName: lead.leadName,
      companyId: lead.companyId,
      companyName: lead.companyName,
      leadTypeCode: lead.leadTypeCode || 0,
      leadSourceCode: lead.leadSourceCode || 0,
      contactId: lead.contactId || 0,
      currencyCode: lead.currencyCode || 0,
      marketCode: lead.marketCode || 0,
      agentId: lead.agentId || 0,
      ownerEmployeeId: lead.ownerEmployeeId || 0,
      probability: lead.probability,
      score: lead.score || 0,
      employees: lead.employees || 0,
      actualSalesValue: lead.actualSalesValue || 0,
      salesGapValue: lead.salesGapValue || 0,
      activityExpansion: lead.activityExpansion || '',
      exportMarketValue: lead.exportMarketValue || 0,
      localMarketValue: lead.localMarketValue || 0,
      exportRatio: lead.exportRatio || 0,
      region: lead.region || '',
      currentInsurerNo: lead.currentInsurerNo || '',
      externalStartDate: lead.externalStartDate || new Date(),
      statusCode: lead.statusCode || 1,
      reasonRejectionCode: lead.reasonRejectionCode || 0,
      rejectionDetail: lead.rejectionDetail || '',
      notes: lead.notes || '',
      additionalInfo: lead.additionalInfo || '',
      openingEffectiveDate: lead.openingEffectiveDate || new Date(),
      closingEffectiveDate: lead.closingEffectiveDate,
      openingRegistrationDate: lead.openingRegistrationDate || new Date(),
      closingRegistrationDate: lead.closingRegistrationDate,
      openingReference: lead.openingReference || 0,
      closingReference: lead.closingReference || 0,
      activeFlag: lead.activeFlag !== undefined ? lead.activeFlag : true
    });
  }

  // New method to handle rejection code change
  onRejectionCodeChange(codeNumber: number): void {
    if (codeNumber) {
      const selectedReason = this.rejectionReasons.find(r => r.codeNumber === codeNumber);
      if (selectedReason) {
        // Auto-populate the rejection description with the code's description
        this.leadForm.patchValue({
          rejectionDetail: selectedReason.codeLongDescription || selectedReason.codeShortDescription
        });
      }
    } else {
      // Clear the rejection detail if no rejection code is selected
      this.leadForm.patchValue({
        rejectionDetail: ''
      });
    }
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
    return this.leadForm.valid;
  }

  save(): void {
    if (!this.isValid()) {
      this.leadForm.markAllAsTouched();
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.saving = true;
    this.error = null;

    // Create lead object from form values
    const leadData: Lead = this.leadForm.value;

    if (this.isNewLead) {
      // Create new lead
      this.leadService.createLead(leadData).subscribe({
        next: (createdLead) => {
          // If we have custom fields, save them
          if (this.customFieldsContainer) {
            const customFieldValues = this.customFieldsContainer.prepareCustomFieldValues();
            
            if (customFieldValues.length > 0) {
              // Update entityId with the new lead ID
              customFieldValues.forEach(value => {
                value.entityId = createdLead.leadId;
              });
              
              // Save custom field values
              this.saveCustomFieldValues(customFieldValues, createdLead);
            } else {
              this.handleSaveSuccess(createdLead);
            }
          } else {
            this.handleSaveSuccess(createdLead);
          }
        },
        error: (err) => {
          this.handleSaveError(err);
        }
      });
    } else {
      // Update existing lead
      this.leadService.updateLead(leadData.leadId || 0, leadData).subscribe({
        next: (updatedLead) => {
          // If we have custom fields, save them
          if (this.customFieldsContainer) {
            const customFieldValues = this.customFieldsContainer.prepareCustomFieldValues();
            
            if (customFieldValues.length > 0) {
              // Save custom field values
              this.saveCustomFieldValues(customFieldValues, updatedLead);
            } else {
              this.handleSaveSuccess(updatedLead);
            }
          } else {
            this.handleSaveSuccess(updatedLead);
          }
        },
        error: (err) => {
          this.handleSaveError(err);
        }
      });
    }
  }

  /**
   * Save custom field values
   */
  saveCustomFieldValues(customFieldValues: any[], lead: Lead): void {
    // Use CustomFieldService to save the values
    // Assuming customFieldService has a saveValues method
    // This would need to be imported and injected if not already
    this.customFieldsContainer['customFieldService'].saveValues(customFieldValues)
      .subscribe({
        next: () => {
          this.handleSaveSuccess(lead);
        },
        error: (err) => {
          console.error('Error saving custom fields:', err);
          // Still mark the lead save as successful, just show a warning
          this.snackBar.open(
            this.translocoService.translate('LEADS.CUSTOM_FIELDS_ERROR') || 'Some custom fields could not be saved',
            this.translocoService.translate('BUTTONS.CLOSE') || 'Close',
            { duration: 5000, panelClass: ['warning-snackbar'] }
          );
          this.handleSaveSuccess(lead);
        }
      });
  }

  /**
   * Handle successful save
   */
  handleSaveSuccess(lead: Lead): void {
    this.saving = false;
    this.snackBar.open(
      this.translocoService.translate(this.isNewLead ? 'LEADS.CREATE_SUCCESS' : 'LEADS.UPDATE_SUCCESS') || 
        (this.isNewLead ? 'Lead created successfully' : 'Lead updated successfully'),
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
  }

  /**
   * Handle save error
   */
  handleSaveError(err: any): void {
    this.saving = false;
    this.error = 'Failed to save lead. Please try again.';
    console.error('Error saving lead:', err);
    
    this.snackBar.open(
      this.translocoService.translate(this.isNewLead ? 'LEADS.CREATE_ERROR' : 'LEADS.UPDATE_ERROR') || 
        (this.isNewLead ? 'Failed to create lead' : 'Failed to update lead'),
      this.translocoService.translate('BUTTONS.CLOSE') || 'Close',
      { duration: 3000, panelClass: ['error-snackbar'] }
    );
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
    const currencyCode = this.leadForm.get('currencyCode')?.value;
    
    if (!currencyCode || currencyCode === 0) 
      return 'NIS';
    
    const selectedCurrency = this.currencies.find(c => c.codeNumber === currencyCode);
    return selectedCurrency ? selectedCurrency.codeShortDescription : 'NIS';
  }
}