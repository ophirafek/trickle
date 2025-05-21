import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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

// For notes
newNote: Note = this.getEmptyNote();
isAddingNote: boolean = false;
noteError: string | null = null;

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
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['company'] && !changes['company'].firstChange) {
    // Any special handling if company changes
  }
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
    this.generalCodeService.getCodesByType(25)
    .subscribe({
      next: (codes) => {
        this.countryCodes = codes.filter(code => code.isActive);
      },
      error: (err) => {
        console.error('Error loading business field codes:', err);
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
getCountryCodeDescription(countryCode: number | undefined): string {
  if (!countryCode || !this.countryCodes.length) return 'N/A';
  
  const country = this.countryCodes.find(code => code.codeNumber === countryCode);
  return country ? country.codeShortDescription : 'N/A';
}// general-info.component.ts

}