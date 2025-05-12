// src/app/components/company-detail/company-detail.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company, Contact, Note, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralCode, GeneralCodeService } from '../../services/general-codes.service';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyDetailComponent implements OnInit {
  // For contact table
  displayedContactColumns: string[] = ['name', 'jobTitle', 'email', 'phone', 'actions'];
  
  editingCompany: Company = this.getEmptyCompany();
  isNewCompany: boolean = true;
  
  // For contact management
  newContact: Contact = this.getEmptyContact();
  isAddingContact: boolean = false;
  contactError: string | null = null;
  
  // For note management
  newNote: Note = this.getEmptyNote();
  isAddingNote: boolean = false;
  noteError: string | null = null;
  
  // For lead management
  companyLeads: Lead[] = [];
  leadLoading: boolean = false;
  leadError: string | null = null;
  
  // Active tab
  activeTab: 'general' | 'details' | 'address' | 'communication' | 'contacts' | 'notes' | 'leads' | 'insured' = 'general';
  
  // Expanded section (for collapsible sections)
  expandedSection: string = 'companyInfo';
  
  // Loading state
  loading: boolean = false;
  
  // Code tables
  idTypeCodes: any[] = [];
  statusCodes: any[] = [];
  businessFieldCodes: any[] = [];
  entityTypeCodes: any[] = [];
  countryCodes: any[] = [];
  
  currentLanguageCode: number = 1; // Default to English (1)

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
    this.setupLanguage();
    
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
    
    // Load required code tables
    this.loadCodeTables();

    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab) {
        this.activeTab = tab as any;
        
        // If leads tab is selected and we have a company ID, load leads
        if (tab === 'leads' && !this.isNewCompany && this.editingCompany.id) {
          this.loadCompanyLeads();
        }
      }
    });
  }
  
  setupLanguage(): void {
    // Set the current language code based on the active language
    const languageMap: { [key: string]: number } = {
      'en': 1, // English
      'he': 2  // Hebrew
      // Add more languages as needed
    };
    
    const currentLang = this.translocoService.getActiveLang();
    this.currentLanguageCode = languageMap[currentLang] || 1; // Default to 1 if not found
  }

  loadCompany(id: number): void {
    this.loading = true;
    this.companyService.getCompany(id).subscribe({
      next: (company) => {
        this.editingCompany = company;
        
        // Ensure collections are initialized
        if (!this.editingCompany.contacts) this.editingCompany.contacts = [];
        if (!this.editingCompany.notes) this.editingCompany.notes = [];
        
        this.loading = false;
        
        // If on the leads tab, load the leads data
        if (this.activeTab === 'leads') {
          this.loadCompanyLeads();
        }
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

  loadCodeTables(): void {
    // Load all required code tables
    this.generalCodeService.getIdTypeCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.idTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading ID type codes:', err);
        }
      });
      
    this.generalCodeService.getStatusCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.statusCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading status codes:', err);
        }
      });
      
    this.generalCodeService.getBusinessFieldCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.businessFieldCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading business field codes:', err);
        }
      });
      
    this.generalCodeService.getEntityTypeCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.entityTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err: Error) => {
          console.error('Error loading entity type codes:', err);
        }
      });
      
    this.generalCodeService.getCountryCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes : GeneralCode[]) => {
          this.countryCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading country codes:', err);
        }
      });
  }

  // Get code description by code number from a code table
  getCodeDescription(codes: any[], codeNumber: number): string {
    if (!codeNumber || !codes || !codes.length) return 'N/A';
    
    const code = codes.find(c => c.codeNumber === codeNumber);
    return code ? code.codeShortDescription : 'N/A';
  }
  
  getEmptyCompany(): Company {
    return {
      id: 0,
      idTypeCode: 1, // Default ID type code
      registrationNumber: '',
      dunsNumber: '',
      vatNumber: '',
      registrationName: '',
      tradeName: '',
      englishName: '',
      companyStatusCode: 1, // Default to 'Active'
      businessFieldCode: 0,
      entityTypeCode: 0,
      foundingYear: 0,
      countryCode: 0,
      website: '',
      streetAddress: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      phoneNumber: '',
      mobileNumber: '',
      faxNumber: '',
      emailAddress: '',
      remarks: '',
      lastReportName: '',
      openingRef: '',
      closingRef: '',
      assignedTeamMemberName: '',
      contacts: [],
      notes: []
    };
  }
  
  getEmptyContact(): Contact {
    return {
      id: 0,
      name: '',
      jobTitle: '',
      email: '',
      phone: '',
      companyId: this.editingCompany?.id || 0
    };
  }
  
  getEmptyNote(): Note {
    return {
      id: 0,
      title: '',
      content: '',
      companyId: this.editingCompany?.id || 0,
      createdAt: new Date()
    };
  }

  // Toggle section expansion
  toggleSection(section: string): void {
    if (this.expandedSection === section) {
      this.expandedSection = '';
    } else {
      this.expandedSection = section;
    }
  }
  
  navigateToTab(tab: 'general' | 'details' | 'address' | 'communication' | 'contacts' | 'notes' | 'leads' | 'insured'): void {
    this.activeTab = tab;
    
    // Update the URL without reloading the component
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    
    // If navigating to leads tab and we have a company with an ID, load the leads
    if (tab === 'leads' && !this.isNewCompany && this.editingCompany.id) {
      this.loadCompanyLeads();
    }
  }

  navigateToCompanies(): void {
    this.router.navigate(['/companies']);
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
  
  // Contact methods
  startAddingContact(): void {
    this.isAddingContact = true;
    this.newContact = this.getEmptyContact();
    this.newContact.companyId = this.editingCompany.id;
  }
  
  cancelAddContact(): void {
    this.isAddingContact = false;
    this.newContact = this.getEmptyContact();
    this.contactError = null;
  }
  
  addContact(): void {
    if (!this.newContact.name) {
      this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_NAME_REQUIRED');
      return;
    }
    
    this.loading = true;
    this.contactError = null;
    
    this.companyService.addContact(this.editingCompany.id, this.newContact)
      .subscribe({
        next: (contact) => {
          // Add the new contact to the local array
          if (!this.editingCompany.contacts) {
            this.editingCompany.contacts = [];
          }
          this.editingCompany.contacts.push(contact);
          
          // Reset the form
          this.isAddingContact = false;
          this.newContact = this.getEmptyContact();
          this.loading = false;
          
          // Show success message
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CONTACT_ADD_SUCCESS'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            { duration: 3000 }
          );
        },
        error: (err) => {
          this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_ADD_ERROR');
          this.loading = false;
          console.error('Error adding contact:', err);
        }
      });
  }
  
  deleteContact(contactId: number): void {
    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
      this.loading = true;
      
      this.companyService.deleteContact(contactId)
        .subscribe({
          next: () => {
            // Remove the contact from the local array
            if (this.editingCompany.contacts) {
              this.editingCompany.contacts = this.editingCompany.contacts.filter(c => c.id !== contactId);
            }
            this.loading = false;
            
            // Show success message
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.CONTACT_DELETE_SUCCESS'), 
              this.translocoService.translate('BUTTONS.CLOSE'), 
              { duration: 3000 }
            );
          },
          error: (err) => {
            this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_DELETE_ERROR');
            this.loading = false;
            console.error('Error deleting contact:', err);
          }
        });
    }
  }
  
  // Note methods
  startAddingNote(): void {
    this.isAddingNote = true;
    this.newNote = this.getEmptyNote();
    this.newNote.companyId = this.editingCompany.id;
  }
  
  cancelAddNote(): void {
    this.isAddingNote = false;
    this.newNote = this.getEmptyNote();
    this.noteError = null;
  }
  
  addNote(): void {
    if (!this.newNote.title || !this.newNote.content) {
      this.noteError = this.translocoService.translate('COMPANY_DETAIL.NOTE_FIELDS_REQUIRED');
      return;
    }
    
    this.loading = true;
    this.noteError = null;
    
    this.companyService.addNote(this.editingCompany.id, this.newNote)
      .subscribe({
        next: (note) => {
          // Add the new note to the local array
          if (!this.editingCompany.notes) {
            this.editingCompany.notes = [];
          }
          this.editingCompany.notes.push(note);
          
          // Reset the form
          this.isAddingNote = false;
          this.newNote = this.getEmptyNote();
          this.loading = false;
          
          // Show success message
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.NOTE_ADD_SUCCESS'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            { duration: 3000 }
          );
        },
        error: (err) => {
          this.noteError = this.translocoService.translate('COMPANY_DETAIL.NOTE_ADD_ERROR');
          this.loading = false;
          console.error('Error adding note:', err);
        }
      });
  }
  
  deleteNote(noteId: number): void {
    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
      this.loading = true;
      
      this.companyService.deleteNote(noteId)
        .subscribe({
          next: () => {
            // Remove the note from the local array
            if (this.editingCompany.notes) {
              this.editingCompany.notes = this.editingCompany.notes.filter(n => n.id !== noteId);
            }
            this.loading = false;
            
            // Show success message
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.NOTE_DELETE_SUCCESS'), 
              this.translocoService.translate('BUTTONS.CLOSE'), 
              { duration: 3000 }
            );
          },
          error: (err) => {
            this.noteError = this.translocoService.translate('COMPANY_DETAIL.NOTE_DELETE_ERROR');
            this.loading = false;
            console.error('Error deleting note:', err);
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
      .subscribe({
        next: (leads) => {
          this.companyLeads = leads;
          this.leadLoading = false;
          console.log('Loaded leads:', leads.length);
        },
        error: (err) => {
          this.leadError = this.translocoService.translate('COMPANY_DETAIL.LEAD_LOAD_ERROR');
          this.leadLoading = false;
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
    if (lead.id) {
      // Navigate to edit the lead
      this.router.navigate(['/leads', lead.id]);
    } else {
      // Handle case when lead might not have ID
      console.error('Cannot edit lead without an ID');
      this.snackBar.open('Cannot edit this lead', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Helper methods for template
  getStatusText(statusCode: number): string {
    return this.getCodeDescription(this.statusCodes, statusCode);
  }
  
  getBusinessFieldText(businessFieldCode: number): string {
    return this.getCodeDescription(this.businessFieldCodes, businessFieldCode);
  }
  
  getEntityTypeText(entityTypeCode: number): string {
    return this.getCodeDescription(this.entityTypeCodes, entityTypeCode);
  }
  
  getCountryText(countryCode: number): string {
    return this.getCodeDescription(this.countryCodes, countryCode);
  }
  
  getIdTypeText(idTypeCode: number): string {
    return this.getCodeDescription(this.idTypeCodes, idTypeCode);
  }
}