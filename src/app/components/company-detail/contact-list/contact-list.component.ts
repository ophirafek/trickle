// contact-list.component.ts
import { Component, OnInit, Input, ViewChild, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { TranslocoService } from '@ngneat/transloco';

import { Company, Contact } from '../../../../model/types';
import { CompanyService } from '../../../services/company.service';
import { GeneralCode, GeneralCodeService } from '../../../services/general-codes.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  @Input() company!: Company;
  
  // Table columns
  displayedColumns: string[] = ['fullName', 'contactCode', 'position', 'phoneNumber', 'email', 'actions'];
  
  // Contact state
  contacts: Contact[] = [];
  currentContact: Contact = this.getEmptyContact();
  isAddingContact: boolean = false;
  isEditingContact: boolean = false;
  contactError: string | null = null;
  
  // Loading state
  loading: boolean = false;
  
  // General codes for contact types
  contactCodes: GeneralCode[] = [];
  
  @ViewChild('contactDialog') contactDialog!: TemplateRef<any>;

  constructor(
    private companyService: CompanyService,
    private generalCodeService: GeneralCodeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService
  ) { }

  ngOnInit(): void {
    this.loadContactCodes();
    this.loadContacts();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Check if company has changed
    if (changes['company'] && !changes['company'].firstChange) {
      // Reset current form state
      this.cancelForm();
      
      // Reload contacts with the new company
      this.loadContacts();
    }
  }
  
  /**
   * Load general codes for contact types
   */
  loadContactCodes(): void {
    this.loading = true;
    this.generalCodeService.getCodesByType(40)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (codes) => {
          this.contactCodes = codes;
        },
        error: (err) => {
          console.error('Error loading contact codes:', err);
        }
      });
  }
  
  /**
   * Load contacts for the current company
   */
  loadContacts(): void {
    if (!this.company || !this.company.id) {
      this.contacts = [];
      return;
    }
    
    this.loading = true;
    
    // If service has a dedicated method to get company contacts, use that
    if (this.companyService.getCompanyContacts) {
      this.companyService.getCompanyContacts(this.company.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (contacts) => {
            this.contacts = contacts.map(contact => ({
              ...contact,
              fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
            }));
            
            // Update company.contacts reference if it exists
            if (this.company) {
              this.company.contacts = [...contacts];
            }
          },
          error: (err) => {
            console.error('Error loading contacts:', err);
            this.contacts = [];
            
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.CONTACT_LOAD_ERROR'),
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
        });
    } 
    // Otherwise, use the contacts from the company object
    else if (this.company.contacts) {
      this.contacts = this.company.contacts.map(contact => {
        // Add fullName as a computed property
        return {
          ...contact,
          fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
        };
      });
      this.loading = false;
    } else {
      // No contacts available
      this.contacts = [];
      this.loading = false;
    }
  }
  
  /**
   * Create an empty contact object
   */
  getEmptyContact(): Contact {
    return {
      id: 0,
      companyID: this.company?.id || 0,
      firstName: '',
      lastName: '',
      activeFlag: true,
      openingEffecDate: new Date(),
      openingRegDate: new Date()
    };
  }
  
  /**
   * Open dialog to add a new contact
   */
  startAddingContact(): void {
    this.isAddingContact = true;
    this.isEditingContact = false;
    this.currentContact = this.getEmptyContact();
    this.contactError = null;
  }
  
  /**
   * Open dialog to edit a contact
   */
  startEditingContact(contact: Contact): void {
    this.isEditingContact = true;
    this.isAddingContact = false;
    this.currentContact = { ...contact };
    this.contactError = null;
  }
  
  /**
   * Cancel form
   */
  cancelForm(): void {
    this.isAddingContact = false;
    this.isEditingContact = false;
    this.currentContact = this.getEmptyContact();
    this.contactError = null;
  }
  
  /**
   * Save contact (add or update)
   */
  saveContact(): void {
    if (!this.currentContact.firstName && !this.currentContact.lastName) {
      this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_NAME_REQUIRED');
      return;
    }
    
    this.loading = true;
    this.contactError = null;
    
    // Check if adding or editing
    if (this.isAddingContact) {
      this.addContact();
    } else if (this.isEditingContact) {
      this.updateContact();
    }
  }
  
  /**
   * Add a new contact
   */
  private addContact(): void {
    // Ensure companyID is set
    this.currentContact.companyID = this.company.id;
    
    this.companyService.addContact(this.company.id, this.currentContact)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (contact) => {
          // Add fullName property
          const newContact = {
            ...contact,
            fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
          };
          
          // Add the new contact to the local array
          this.contacts.push(newContact);
          
          // Update the company object's contacts array if it exists
          if (this.company.contacts) {
            this.company.contacts.push(contact);
          } else {
            this.company.contacts = [contact];
          }
          
          // Reset the form
          this.isAddingContact = false;
          this.currentContact = this.getEmptyContact();
          
          // Show success message
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CONTACT_ADD_SUCCESS'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (err) => {
          this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_ADD_ERROR');
          console.error('Error adding contact:', err);
          
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CONTACT_ADD_ERROR'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }
  
  /**
   * Update an existing contact
   */
  private updateContact(): void {
    this.companyService.updateContact(this.currentContact.id, this.currentContact)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          // Update the contact in the local array
          const index = this.contacts.findIndex(c => c.id === this.currentContact.id);
          if (index !== -1) {
            // Add fullName property
            this.contacts[index] = {
              ...this.currentContact,
              fullName: `${this.currentContact.firstName || ''} ${this.currentContact.lastName || ''}`.trim()
            };
          }
          
          // Update the company object's contacts array if it exists
          if (this.company.contacts) {
            const companyContactIndex = this.company.contacts.findIndex(c => c.id === this.currentContact.id);
            if (companyContactIndex !== -1) {
              this.company.contacts[companyContactIndex] = this.currentContact;
            }
          }
          
          // Reset the form
          this.isEditingContact = false;
          this.currentContact = this.getEmptyContact();
          
          // Show success message
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CONTACT_UPDATE_SUCCESS'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: (err) => {
          this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_UPDATE_ERROR');
          console.error('Error updating contact:', err);
          
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.CONTACT_UPDATE_ERROR'), 
            this.translocoService.translate('BUTTONS.CLOSE'), 
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }
  
  /**
   * Delete a contact
   */
  deleteContact(contactId: number): void {
    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
      this.loading = true;
      
      this.companyService.deleteContact(contactId)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            // Remove the contact from the local array
            this.contacts = this.contacts.filter(c => c.id !== contactId);
            
            // Remove the contact from the company object's contacts array if it exists
            if (this.company.contacts) {
              this.company.contacts = this.company.contacts.filter(c => c.id !== contactId);
            }
            
            // Show success message
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.CONTACT_DELETE_SUCCESS'), 
              this.translocoService.translate('BUTTONS.CLOSE'), 
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          },
          error: (err) => {
            this.contactError = this.translocoService.translate('COMPANY_DETAIL.CONTACT_DELETE_ERROR');
            console.error('Error deleting contact:', err);
            
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.CONTACT_DELETE_ERROR'), 
              this.translocoService.translate('BUTTONS.CLOSE'), 
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
        });
    }
  }

  /**
   * Get contact code description
   */
  getContactCodeDescription(code: number): string {
    if (!code) return '';
    
    const contactCode = this.contactCodes.find(c => c.codeNumber === code);
    return contactCode ? contactCode.codeShortDescription : '';
  }
}