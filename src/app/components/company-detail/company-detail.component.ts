// Updated company-detail.component.ts with async contact loading

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralCodeService, GeneralCode } from '../../services/general-codes.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyDetailComponent implements OnInit {
  editingCompany: Company = this.getEmptyCompany();
  isNewCompany: boolean = true;
  
  // For lead management
  companyLeads: Lead[] = [];
  leadLoading: boolean = false;
  leadLoaded: boolean = false;
  leadError: string | null = null;
  
  // For contact management
  contactsLoading: boolean = false;
  contactsLoaded: boolean = false;
  contactError: string | null = null;
  
  // For insured data management
  insuredLoading: boolean = false;
  insuredLoaded: boolean = false;
  insuredError: string | null = null;
  
  // Form validation
  formIsValid: boolean = true;
  
  // Active tab - Updated to remove 'address' and 'notes'
  activeTab: 'general' | 'contacts' | 'leads' | 'insured' = 'general';
  
  // Loading state
  loading: boolean = false;
  idTypeCodes: GeneralCode[] = [];
  currentLanguageCode: number = 1; // Default to English (1), adjust based on your language setup

  constructor(
    private companyService: CompanyService,
    private leadService: LeadService,
    private translocoService: TranslocoService,
    private generalCodeService: GeneralCodeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id && id !== 'new') {
        this.loadCompany(parseInt(id, 10));
        this.isNewCompany = false;
      } else {
        this.editingCompany = this.getEmptyCompany();
        this.isNewCompany = true;
      }
    });
    
    const languageMap: { [key: string]: number } = {
      'en': 1, // English
      'he': 2  // Hebrew
      // Add more languages as needed
    };
    
    // Set the current language code
    const currentLang = this.translocoService.getActiveLang();
    this.currentLanguageCode = languageMap[currentLang] || 1; // Default to 1 if not found
    
    // Load ID type codes
    this.loadIdTypeCodes();

    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab) {
        this.activeTab = tab as any;
        
        // Load data for the active tab if needed
        this.loadTabData(this.activeTab);
      }
    });
  }

  /**
   * Load data specific to the active tab
   * This allows for lazy loading of tab content
   */
  loadTabData(tab: 'general' | 'contacts' | 'leads' | 'insured'): void {
    // Only load data if we have a company with an ID (not a new company)
    if (this.isNewCompany || !this.editingCompany.id) {
      return;
    }
    
    switch (tab) {
      case 'contacts':
        // Contacts are already being loaded automatically when the company loads
        // We only need to ensure the loading has started
        if (!this.contactsLoaded && !this.contactsLoading) {
          this.loadContacts();
        }
        break;
      case 'leads':
        // Leads are already being loaded automatically when the company loads
        // We only need to ensure the loading has started
        if (!this.leadLoaded && !this.leadLoading) {
          this.loadCompanyLeads();
        }
        break;
      case 'insured':
        // Insured data is already being loaded automatically when the company loads
        // We only need to ensure the loading has started
        if (!this.insuredLoaded && !this.insuredLoading && this.editingCompany.isInsured) {
          this.loadInsuredData();
        }
        break;
    }
  }

  loadCompany(id: number): void {
    this.loading = true;
    this.companyService.getCompany(id).subscribe({
      next: (company) => {
        this.editingCompany = company;
        
        // Initialize collections
        if (!this.editingCompany.contacts) this.editingCompany.contacts = [];
        if (!this.editingCompany.notes) this.editingCompany.notes = [];
        
        this.loading = false;
        
        // Start loading all tab data immediately in the background
        this.loadAllTabData();
        
        // Load data for the current active tab if needed (for immediate display)
        this.loadTabData(this.activeTab);
      },
      error: (err) => {
        this.snackBar.open('Error loading company details', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Error loading company details:', err);
        this.loading = false;
        this.router.navigate(['/companies']);
      }
    });
  }

  /**
   * Load all tab data in the background
   * This ensures all data is ready when users switch tabs
   */
  loadAllTabData(): void {
    if (this.isNewCompany || !this.editingCompany.id) {
      return;
    }
    
    // Start loading contacts
    this.loadContacts();
    
    // Start loading leads
    this.loadCompanyLeads();
    
    // Start loading insured data if applicable
    if (this.editingCompany.isInsured) {
      this.loadInsuredData();
    }
  }

  /**
   * Load company contacts asynchronously
   */
  loadContacts(): void {
    if (!this.editingCompany || !this.editingCompany.id) {
      return;
    }
    
    this.contactsLoading = true;
    this.contactError = null;
    
    this.companyService.getCompanyContacts(this.editingCompany.id)
      .pipe(
        finalize(() => {
          this.contactsLoading = false;
          this.contactsLoaded = true;
        })
      )
      .subscribe({
        next: (contacts) => {
          this.editingCompany.contacts = contacts;
        },
        error: (err) => {
          this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_LOAD_ERROR');
          console.error('Error loading contacts:', err);
          
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CONTACT_LOAD_ERROR'),
            this.translocoService.translate('BUTTONS.CLOSE'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  loadIdTypeCodes(): void {
    this.generalCodeService.getIdTypeCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.idTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading ID type codes:', err);
        }
      });
  }

  getIdTypeDescription(idTypeCode: number | undefined): string {
    if (!idTypeCode || !this.idTypeCodes.length) return 'N/A';
    
    const idType = this.idTypeCodes.find(code => code.codeNumber === idTypeCode);
    return idType ? idType.codeShortDescription : 'N/A';
  }
  
  getEmptyCompany(): Company {
    return {
      id: 0,
      idTypeCode: 0,
      registrationName: '',
      website: '',
      registrationNumber: '',
      dunsNumber: '',
      contacts: [],
      notes: [],
      isInsured: false,
      isDebtor: false,
      isPotentialClient: false,
      isAgent: false
    };
  }
  
  navigateToTab(tab: 'general' | 'contacts' | 'leads' | 'insured'): void {
    this.activeTab = tab;
    
    // Update the URL without reloading the component
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    
    // Check if data is already loading or loaded to avoid duplicate requests
    switch (tab) {
      case 'contacts':
        if (this.contactsLoading || this.contactsLoaded) {
          return;
        }
        break;
      case 'leads':
        if (this.leadLoading || this.leadLoaded) {
          return;
        }
        break;
      case 'insured':
        if (this.insuredLoading || this.insuredLoaded) {
          return;
        }
        break;
    }
    
    // Load data for the selected tab if needed
    this.loadTabData(tab);
  }

  navigateToCompanies(): void {
    this.router.navigate(['/companies']);
  }
  
  /**
   * Handle form validation state changes from child components
   */
  onFormValidityChange(isValid: boolean): void {
    this.formIsValid = isValid;
  }

  save(): void {
    if (!this.editingCompany.registrationName || !this.editingCompany.registrationName.trim()) {
      this.snackBar.open(
        this.translocoService.translate('COMPANY_DETAIL.NAME_REQUIRED'), 
        this.translocoService.translate('BUTTONS.CLOSE'), 
        {
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }
    
    this.loading = true;
    
    if (this.isNewCompany) {
      // Create new company
      this.companyService.createCompany(this.editingCompany).subscribe({
        next: (company) => {
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CREATE_SUCCESS'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.loading = false;
          this.router.navigate(['/companies']);
        },
        error: (err) => {
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CREATE_ERROR'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
          this.loading = false;
          console.error('Error creating company:', err);
        }
      });
    } else {
      // Update existing company
      this.companyService.updateCompany(this.editingCompany.id, this.editingCompany).subscribe({
        next: () => {
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.UPDATE_SUCCESS'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.loading = false;
          this.router.navigate(['/companies']);
        },
        error: (err) => {
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.UPDATE_ERROR'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
          this.loading = false;
          console.error('Error updating company:', err);
        }
      });
    }
  }
  
  // Lead methods
  loadCompanyLeads(): void {
    if (!this.editingCompany || !this.editingCompany.id) return;
    
    this.leadLoading = true;
    this.leadError = null;
    
    this.leadService.getLeadsByCompany(this.editingCompany.id)
      .pipe(
        finalize(() => {
          this.leadLoading = false;
          this.leadLoaded = true;
        })
      )
      .subscribe({
        next: (leads) => {
          this.companyLeads = leads;
        },
        error: (err) => {
          this.leadError = this.translocoService.translate('COMPANY_DETAIL.LEAD_LOAD_ERROR');
          console.error('Error loading company leads:', err);
          
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.LEAD_LOAD_ERROR'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
  }

  /**
   * Load insured-specific data
   * This would typically include assignments, financial data, etc.
   */
  loadInsuredData(): void {
    if (!this.editingCompany || !this.editingCompany.id || !this.editingCompany.isInsured) {
      return;
    }
    
    this.insuredLoading = true;
    this.insuredError = null;
    
    // Here you would typically load insured-specific data
    // For now, we'll simulate the loading and complete immediately
    // In a real app, this might load assignments, financial data, etc.
    
    setTimeout(() => {
      // Simulate async loading completion
      this.insuredLoading = false;
      this.insuredLoaded = true;
      
      // If you had actual insured data to load, you would do it here:
      // this.insuredService.getInsuredData(this.editingCompany.id)
      //   .pipe(finalize(() => { this.insuredLoading = false; this.insuredLoaded = true; }))
      //   .subscribe({
      //     next: (data) => { /* handle insured data */ },
      //     error: (err) => { 
      //       this.insuredError = this.translocoService.translate('COMPANY_DETAIL.INSURED_LOAD_ERROR');
      //       console.error('Error loading insured data:', err);
      //       
      //       this.snackBar.open(
      //         this.translocoService.translate('COMPANY_DETAIL.INSURED_LOAD_ERROR'), 
      //         this.translocoService.translate('BUTTONS.CLOSE'), 
      //         { duration: 3000, panelClass: ['error-snackbar'] }
      //       );
      //     }
      //   });
    }, 100);
  }

  getLeadStatusColor(status: string): ThemePalette {
    const colorMap: { [key: string]: ThemePalette } = {
      'New': 'primary',
      'Contacted': 'accent',
      'Qualified': 'primary',
      'Proposal': 'accent',
      'Negotiation': 'warn'
    };
    return colorMap[status] || 'primary';
  }

  createNewLead(): void {
    if (!this.editingCompany) return;
    
    // Navigate to the leads page with company information
    this.router.navigate(['/leads/new'], {
      queryParams: {
        companyId: this.editingCompany.id,
        companyName: this.editingCompany.registrationName
      }
    });
  }

  editLead(lead: Lead): void {
    // Check if lead has an ID (existing lead)
    if (lead.leadId) {
      // Navigate to edit the lead
      this.router.navigate(['/leads', lead.leadId]);
    } else {
      // Handle case when lead might not have ID
      console.error('Cannot edit lead without an ID');
      this.snackBar.open('Cannot edit this lead', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

 
  deleteLead(leadId: number): void {
    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
      this.leadLoading = true;
      
      this.leadService.deleteLead(leadId)
        .subscribe({
          next: () => {
            // Refresh the leads list
            this.loadCompanyLeads();
            
            this.snackBar.open('Lead deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (err) => {
            this.leadError = 'Failed to delete lead';
            this.leadLoading = false;
            console.error('Error deleting lead:', err);
            
            this.snackBar.open('Failed to delete lead', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  onLeadDeleted(leadId: number): void {
    // Remove the lead from the local array
    this.companyLeads = this.companyLeads.filter(lead => lead.leadId !== leadId);
  }
}