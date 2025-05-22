// Updated general-info.component.ts with improved validation

import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Company, Note } from '../../../../model/types';
import { GeneralCodeService, GeneralCode } from '../../../services/general-codes.service';
import { CompanyService } from '../../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss']
})
export class GeneralInfoComponent implements OnInit, OnChanges {
  @Input() company!: Company;
  @Output() validationError = new EventEmitter<string>();
  @Output() formValid = new EventEmitter<boolean>();

  // For notes
  newNote: Note = this.getEmptyNote();
  isAddingNote: boolean = false;
  noteError: string | null = null;

  // Validation
  validationErrors: { [key: string]: string } = {}; // Map field names to error messages
  sectionsWithErrors: string[] = [];
  touchedFields: string[] = []; // Track which fields user has interacted with

  // General codes
  idTypeCodes: GeneralCode[] = [];
  statusCodes: GeneralCode[] = [];
  entityTypeCodes: GeneralCode[] = [];
  businessFieldCodes: GeneralCode[] = [];
  countryCodes: GeneralCode[] = [];

  // Active section for collapsible sections
  expandedSection: string = 'registrationNumbers';

  // Loading state
  loading: boolean = false;
  currentLanguageCode: number = 1; // Default to English (1)

  constructor(
    private companyService: CompanyService,
    private generalCodeService: GeneralCodeService,
    private translocoService: TranslocoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const languageMap: { [key: string]: number } = {
      'en': 1, // English
      'he': 2  // Hebrew
      // Add more languages as needed
    };
    
    // Set the current language code
    const currentLang = this.translocoService.getActiveLang();
    this.currentLanguageCode = languageMap[currentLang] || 1; // Default to 1 if not found
    
    // Load general codes
    this.loadGeneralCodes();
    
    // Validate required fields on init and emit form validity
    this.validateAllFields();
    this.formValid.emit(Object.keys(this.validationErrors).length === 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company'] && !changes['company'].firstChange) {
      // Validate required fields when company changes and emit form validity
      this.validateAllFields();
      this.formValid.emit(Object.keys(this.validationErrors).length === 0);
    }
  }

  /**
   * Mark a field as touched and validate it
   * @param fieldName The name of the field to mark as touched
   */
  markFieldAsTouched(fieldName: string): void {
    if (!this.touchedFields.includes(fieldName)) {
      this.touchedFields.push(fieldName);
    }
    this.validateField(fieldName);
  }

  /**
   * Validate a specific field
   * @param fieldName The name of the field to validate
   */
  validateField(fieldName: string): void {
    // Clear any existing error for this field
    delete this.validationErrors[fieldName];

    // Skip validation for untouched fields
    if (!this.touchedFields.includes(fieldName)) {
      return;
    }

    switch (fieldName) {
      case 'registrationNumber':
        if (!this.company.registrationNumber || this.company.registrationNumber.trim() === '') {
          this.validationErrors[fieldName] = this.translocoService.translate('VALIDATION.REQUIRED_FIELD');
          this.addSectionWithError('registrationNumbers');
        }
        break;
      case 'registrationName':
        if (!this.company.registrationName || this.company.registrationName.trim() === '') {
          this.validationErrors[fieldName] = this.translocoService.translate('VALIDATION.REQUIRED_FIELD');
          this.addSectionWithError('companyNames');
        }
        break;
      // Add more field validations as needed
    }

    // Update sectionsWithErrors based on current errors
    this.updateSectionsWithErrors();

    // Emit form validity
    const isValid = Object.keys(this.validationErrors).length === 0;
    this.formValid.emit(isValid);

    // Emit validation errors if any
    if (!isValid) {
      this.validationError.emit(Object.values(this.validationErrors).join(', '));
    }
  }

  /**
   * Validate all fields regardless of touched status
   */
  validateAllFields(): void {
    // Reset errors
    this.validationErrors = {};
    this.sectionsWithErrors = [];

    // Add all fields as touched
    this.touchedFields = ['registrationNumber', 'registrationName'];

    // Validate each field
    this.touchedFields.forEach(field => this.validateField(field));

    // Automatically expand the first section with errors if no section is currently expanded
    // or if the currently expanded section doesn't have errors
    if (this.sectionsWithErrors.length > 0 && 
        (this.expandedSection === '' || !this.sectionsWithErrors.includes(this.expandedSection))) {
      this.expandedSection = this.sectionsWithErrors[0];
    }
  }

  /**
   * Add a section to the list of sections with errors
   */
  private addSectionWithError(section: string): void {
    if (!this.sectionsWithErrors.includes(section)) {
      this.sectionsWithErrors.push(section);
    }
  }

  /**
   * Update sections with errors based on current validation errors
   */
  private updateSectionsWithErrors(): void {
    // Reset sections with errors
    this.sectionsWithErrors = [];

    // Add sections based on field errors
    Object.keys(this.validationErrors).forEach(field => {
      if (field === 'registrationNumber') {
        this.addSectionWithError('registrationNumbers');
      } else if (field === 'registrationName') {
        this.addSectionWithError('companyNames');
      }
      // Add more field-to-section mappings as needed
    });
  }
  
  /**
   * Check if there are any validation errors
   * @returns boolean indicating if there are validation errors
   */
  hasValidationErrors(): boolean {
    return Object.keys(this.validationErrors).length > 0;
  }

  /**
   * Updates validation state when a required field changes
   * This helps provide immediate feedback to the user
   */
  onRequiredFieldChange(fieldName: string): void {
    this.markFieldAsTouched(fieldName);
  }

  loadGeneralCodes(): void {
    this.loading = true;
    
    // Load ID type codes
    this.generalCodeService.getIdTypeCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.idTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading ID type codes:', err);
        }
      });
    
    // Load status codes
    this.generalCodeService.getCodesByType(15)
      .subscribe({
        next: (codes) => {
          this.statusCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading status codes:', err);
        }
      });
    
    // Load entity type codes
    this.generalCodeService.getCodesByType(80)
      .subscribe({
        next: (codes) => {
          this.entityTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading entity type codes:', err);
        }
      });
    
    // Load business field codes
    this.generalCodeService.getCodesByType(20)
      .subscribe({
        next: (codes) => {
          this.businessFieldCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading business field codes:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    
    // Load country codes
    this.generalCodeService.getCodesByType(25)
      .subscribe({
        next: (codes) => {
          this.countryCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading country codes:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  // Toggle section expansion
  toggleSection(section: string): void {
    if (this.expandedSection === section) {
      this.expandedSection = '';
    } else {
      this.expandedSection = section;
    }
  }

  getIdTypeDescription(idTypeCode: number | undefined): string {
    if (!idTypeCode || !this.idTypeCodes.length) return 'N/A';
    
    const idType = this.idTypeCodes.find(code => code.codeNumber === idTypeCode);
    return idType ? idType.codeShortDescription : 'N/A';
  }

  getStatusDescription(companyStatusCode: number | undefined): string {
    if (!companyStatusCode || !this.statusCodes.length) return 'N/A';
    
    const status = this.statusCodes.find(code => code.codeNumber === companyStatusCode);
    return status ? status.codeShortDescription : 'N/A';
  }

  getEntityTypeDescription(entityTypeCode: number | undefined): string {
    if (!entityTypeCode || !this.entityTypeCodes.length) return 'N/A';
    
    const entityType = this.entityTypeCodes.find(code => code.codeNumber === entityTypeCode);
    return entityType ? entityType.codeShortDescription : 'N/A';
  }

  getBusinessFieldDescription(businessFieldCode: number | undefined): string {
    if (!businessFieldCode || !this.businessFieldCodes.length) return 'N/A';
    
    const businessField = this.businessFieldCodes.find(code => code.codeNumber === businessFieldCode);
    return businessField ? businessField.codeShortDescription : 'N/A';
  }

  getCountryCodeDescription(countryCode: number | undefined): string {
    if (!countryCode || !this.countryCodes.length) return 'N/A';
    
    const country = this.countryCodes.find(code => code.codeNumber === countryCode);
    return country ? country.codeShortDescription : 'N/A';
  }

  // Note methods
  getEmptyNote(): Note {
    return {
      id: 0,
      title: '',
      content: '',
      companyId: this.company?.id || 0,
      createdAt: new Date()
    };
  }

  startAddingNote(): void {
    this.isAddingNote = true;
    this.newNote = this.getEmptyNote();
    this.newNote.companyId = this.company.id;
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
    
    this.companyService.addNote(this.company.id, this.newNote)
      .subscribe({
        next: (note) => {
          // Add the new note to the local array
          if (!this.company.notes) {
            this.company.notes = [];
          }
          this.company.notes.push(note);
          
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
            if (this.company.notes) {
              this.company.notes = this.company.notes.filter(n => n.id !== noteId);
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
}