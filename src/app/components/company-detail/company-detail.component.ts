import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
import { Company, Contact, Note, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css'],
  encapsulation: ViewEncapsulation.None // This helps with styling nested Material components
})
export class CompanyDetailComponent implements OnInit, OnChanges {
  @Input() company: Company | null = null;
  @Input() isVisible: boolean = false;
  @Input() activeTab: 'general' | 'address' | 'contacts' | 'notes' | 'leads' = 'general';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Company>();
  
  // For contact table
  displayedContactColumns: string[] = ['name', 'jobTitle', 'email', 'phone', 'actions'];
  
  // For lead table
  displayedLeadColumns: string[] = ['title', 'status', 'value', 'probability', 'owner', 'actions'];
  
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
  
  // Loading state
  loading: boolean = false;

  constructor(
    private companyService: CompanyService,
    private leadService: LeadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
    
    // When active tab changes to 'leads', load the leads data
    if (this.activeTab === 'leads' && this.company && this.company.id) {
      this.loadCompanyLeads();
    }
  }

  resetForm(): void {
    if (this.company) {
      // Create a copy to avoid modifying the original object
      this.editingCompany = { ...this.company };
      
      // Ensure collections are initialized
      if (!this.editingCompany.contacts) this.editingCompany.contacts = [];
      if (!this.editingCompany.notes) this.editingCompany.notes = [];
      
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
    
    // Reset lead state
    if (this.activeTab === 'leads' && this.company && this.company.id) {
      this.loadCompanyLeads();
    } else {
      this.companyLeads = [];
    }
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
    // Only handle regular company info tabs
    const tabMap: { [key: string]: number } = {
      'general': 0,
      'address': 1,
      'contacts': 2,
      'notes': 3
    };
    
    // If activeTab is 'leads', we'll return the general tab index
    // as the leads tab is handled separately outside the mat-tab-group
    return this.activeTab === 'leads' ? 0 : (tabMap[this.activeTab] || 0);
  }
  
  onTabChange(index: number): void {
    const tabMap: { [key: number]: string } = {
      0: 'general',
      1: 'address',
      2: 'contacts',
      3: 'notes'
    };
    this.activeTab = tabMap[index] as 'general' | 'address' | 'contacts' | 'notes' | 'leads';
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    if (!this.editingCompany.name || !this.editingCompany.name.trim()) {
      this.snackBar.open('Company name is required', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
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
  
  // Lead methods
  loadCompanyLeads(): void {
    if (!this.company || !this.company.id) return;
    
    this.leadLoading = true;
    this.leadError = null;
    
    this.leadService.getLeadsByCompany(this.company.id)
      .subscribe({
        next: (leads) => {
          this.companyLeads = leads;
          this.leadLoading = false;
          console.log('Loaded leads:', leads.length);
        },
        error: (err) => {
          this.leadError = 'Failed to load company leads';
          this.leadLoading = false;
          console.error('Error loading company leads:', err);
          
          this.snackBar.open('Failed to load leads', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
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
    if (!this.company) return;
    
    // Create a default lead object with company information
    const newLead: Lead = {
      title: '',
      company: this.company.name,
      companyId: this.company.id,
      status: 'New',
      value: 0,
      probability: 0,
      owner: '',
      lastUpdate: new Date().toLocaleDateString()
    };
    
    // TODO: Navigate to lead creation or open a modal
    // This depends on your application's structure
    
    // For now, just create a placeholder lead
    this.leadService.createLead(newLead)
      .subscribe({
        next: (lead) => {
          this.snackBar.open('New lead created', 'Close', {
            duration: 3000
          });
          this.loadCompanyLeads();
        },
        error: (err) => {
          this.leadError = 'Failed to create lead';
          console.error('Error creating lead:', err);
          
          this.snackBar.open('Failed to create lead', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  editLead(lead: Lead, event: Event): void {
    // Stop event propagation to prevent row click handler
    event.stopPropagation();
    
    // TODO: Navigate to lead editing or open a modal
    
    // For now, just show a message
    this.snackBar.open('Edit lead: ' + lead.title, 'Close', {
      duration: 3000
    });
  }

  deleteLead(leadId: number, event: Event): void {
    // Stop event propagation to prevent row click handler
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this lead?')) {
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
}