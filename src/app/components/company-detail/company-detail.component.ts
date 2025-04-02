import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Company, Contact, Note, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css']
})
export class CompanyDetailComponent implements OnInit, OnChanges {
  @Input() company: Company | null = null;
  @Input() isVisible: boolean = false;
  @Input() activeTab: 'general' | 'address' | 'contacts' | 'notes' | 'leads' = 'general';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Company>();

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
  
  // For related leads
  relatedLeads: Lead[] = [];
  leadLoading: boolean = false;
  leadError: string | null = null;
  newLead: Lead = this.getEmptyLead();
  isAddingLead: boolean = false;
  
  // Loading state
  loading: boolean = false;
  
  // Math for template
  Math = Math;

  constructor(
    private companyService: CompanyService, 
    private leadService: LeadService
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
    
    // When the active tab changes to leads, load the related leads
    if (this.activeTab === 'leads' && this.company && this.company.id > 0) {
      this.loadRelatedLeads();
    }
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
  
  // Load leads related to this company using the optimized endpoint
  loadRelatedLeads(): void {
    if (!this.company || !this.company.id) return;
    
    this.leadLoading = true;
    this.leadError = null;
    
    this.leadService.getLeadsByCompany(this.company.id)
      .subscribe({
        next: (leads: Lead[]) => {
          this.relatedLeads = leads;
          this.leadLoading = false;
          console.log('Loaded related leads:', leads);
        },
        error: (err: HttpErrorResponse) => {
          this.leadError = 'Failed to load related leads. Please try again.';
          this.leadLoading = false;
          console.error('Error loading related leads:', err);
        }
      });
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
  
  getEmptyLead(): Lead {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30); // Default to 30 days in the future
    
    return {
      id: 0,
      title: '',
      companyId: this.company?.id || 0,
      company: this.company?.name || '',
      status: 'New',
      value: 0,
      probability: 0,
      owner: '',
      source: 'Website',
      expectedCloseDate: futureDate,
      description: '',
      nextSteps: '',
      lastUpdate: 'Just now'
    };
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
        next: (contact: Contact) => {
          // Add the new contact to the local array
          if (!this.editingCompany.contacts) {
            this.editingCompany.contacts = [];
          }
          this.editingCompany.contacts.push(contact);
          
          // Reset the form
          this.isAddingContact = false;
          this.newContact = this.getEmptyContact();
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
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
          },
          error: (err: HttpErrorResponse) => {
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
        next: (note: Note) => {
          // Add the new note to the local array
          if (!this.editingCompany.notes) {
            this.editingCompany.notes = [];
          }
          this.editingCompany.notes.push(note);
          
          // Reset the form
          this.isAddingNote = false;
          this.newNote = this.getEmptyNote();
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
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
          },
          error: (err: HttpErrorResponse) => {
            this.noteError = 'Failed to delete note. Please try again.';
            this.loading = false;
            console.error('Error deleting note:', err);
          }
        });
    }
  }
  
  // Lead methods
  createNewLead(): void {
    this.isAddingLead = true;
    this.newLead = this.getEmptyLead();
    this.newLead.companyId = this.company?.id || 0;
    this.newLead.company = this.company?.name || '';
  }
  
  cancelAddLead(): void {
    this.isAddingLead = false;
    this.newLead = this.getEmptyLead();
    this.leadError = null;
  }
  
  saveLead(): void {
    if (!this.newLead.title) {
      this.leadError = 'Lead title is required';
      return;
    }
    
    this.loading = true;
    this.leadError = null;
    
    this.leadService.createLead(this.newLead)
      .subscribe({
        next: (lead: Lead) => {
          console.log('Lead created successfully:', lead);
          // Add the new lead to the local array
          this.relatedLeads.push(lead);
          
          // Reset the form
          this.isAddingLead = false;
          this.newLead = this.getEmptyLead();
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.leadError = 'Failed to create lead. Please try again.';
          this.loading = false;
          console.error('Error creating lead:', err);
        }
      });
  }
  
  // Get status color for lead display
  getLeadStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'New': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-yellow-100 text-yellow-700',
      'Qualified': 'bg-purple-100 text-purple-700',
      'Proposal': 'bg-green-100 text-green-700',
      'Negotiation': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }
  
  // Navigate to lead detail
  openLeadDetail(lead: Lead): void {
    console.log('Opening lead detail:', lead);
    // Implementation would depend on your app navigation structure
    // For example, you might use Router to navigate to a lead detail page
  }
}