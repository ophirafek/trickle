import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Company, Contact, Note } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnChanges {
  @Input() company: Company | null = null;
  @Input() isVisible: boolean = false;
  @Input() activeTab: 'general' | 'address' | 'contacts' | 'notes' | 'leads' = 'general';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Company>();
  
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
  
  // Loading state
  loading: boolean = false;

  constructor(
    private companyService: CompanyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
  }

  resetForm(): void {
    if (this.company) {
      // Create a copy to avoid modifying the original object
      this.editingCompany = { ...this.company };
      this.isNewCompany = false;
    } else {
      this.editingCompany = this.getEmptyCompany();
      this.isNewCompany = true;
    }
    
    // Reset contact and note forms
    this.newContact = this.getEmptyContact();
    this.isAddingContact = false;
    this.contactError = null;
    
    this.newNote = this.getEmptyNote();
    this.isAddingNote = false;
    this.noteError = null;
  }

  getEmptyCompany(): Company {
    return {
      id: 0,
      name: '',
      industry: '',
      size: '100-500 employees',
      location: '',
      website: '',
      status: 'Active',
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
      companyId: this.company?.id || 0
    };
  }
  
  getEmptyNote(): Note {
    return {
      id: 0,
      title: '',
      content: '',
      companyId: this.company?.id || 0,
      createdAt: new Date()
    };
  }

  getTabIndex(): number {
    const tabMap: { [key: string]: number } = {
      'general': 0,
      'address': 1,
      'contacts': 2,
      'notes': 3
    };
    return tabMap[this.activeTab] || 0;
  }
  
  onTabChange(index: number): void {
    const tabMap: { [key: number]: string } = {
      0: 'general',
      1: 'address',
      2: 'contacts',
      3: 'notes'
    };
    this.activeTab = tabMap[index] as 'general' | 'address' | 'contacts' | 'notes';
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    // In a real app, would validate the form here
    this.onSave.emit(this.editingCompany);
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
      this.contactError = 'Contact name is required';
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
          this.snackBar.open('Contact added successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.contactError = 'Failed to add contact. Please try again.';
          this.loading = false;
          console.error('Error adding contact:', err);
        }
      });
  }
  
  deleteContact(contactId: number): void {
    if (confirm('Are you sure you want to delete this contact?')) {
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
            this.snackBar.open('Contact deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.contactError = 'Failed to delete contact. Please try again.';
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
      this.noteError = 'Note title and content are required';
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
          this.snackBar.open('Note added successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.noteError = 'Failed to add note. Please try again.';
          this.loading = false;
          console.error('Error adding note:', err);
        }
      });
  }
  
  deleteNote(noteId: number): void {
    if (confirm('Are you sure you want to delete this note?')) {
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
            this.snackBar.open('Note deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.noteError = 'Failed to delete note. Please try again.';
            this.loading = false;
            console.error('Error deleting note:', err);
          }
        });
    }
  }
}