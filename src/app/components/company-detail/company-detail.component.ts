import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company, Contact, Note, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { LeadService } from '../../services/lead.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyDetailComponent implements OnInit {
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
  
  // Active tab
  activeTab: 'general' | 'address' | 'contacts' | 'notes' | 'leads' = 'general';
  
  // Loading state
  loading: boolean = false;

  constructor(
    private companyService: CompanyService,
    private leadService: LeadService,
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

  // Update this method in both companies.component.ts and company-detail.component.ts

getEmptyCompany(): Company {
  return {
    id: 0,
    name: '',
    industry: '',
    size: '100-500 employees',
    location: '',
    website: '',
    status: 'Active',
    registrationNumber: '',  // Added field
    dunsNumber: '',         // Added field
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
    
    const newTab = tabMap[index] as 'general' | 'address' | 'contacts' | 'notes' | 'leads';
    this.navigateToTab(newTab);
  }
  
  navigateToTab(tab: 'general' | 'address' | 'contacts' | 'notes' | 'leads'): void {
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

  close(): void {
    this.router.navigate(['/companies']);
  }

  save(): void {
    if (!this.editingCompany.name || !this.editingCompany.name.trim()) {
      this.snackBar.open('Company name is required', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.loading = true;
    
    if (this.isNewCompany) {
      // Create new company
      this.companyService.createCompany(this.editingCompany).subscribe({
        next: (company) => {
          this.snackBar.open('Company created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.router.navigate(['/companies']);
        },
        error: (err) => {
          this.snackBar.open('Failed to create company', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
          console.error('Error creating company:', err);
        }
      });
    } else {
      // Update existing company
      this.companyService.updateCompany(this.editingCompany.id, this.editingCompany).subscribe({
        next: () => {
          this.snackBar.open('Company updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.router.navigate(['/companies']);
        },
        error: (err) => {
          this.snackBar.open('Failed to update company', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
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
    if (!this.editingCompany) return;
    
    // Navigate to the leads page with company information
    this.router.navigate(['/leads/new'], {
      queryParams: {
        companyId: this.editingCompany.id,
        companyName: this.editingCompany.name
      }
    });
  }

  editLead(lead: Lead): void {
    // Navigate to edit the lead
    this.router.navigate(['/leads', lead.id]);
  }

  deleteLead(leadId: number): void {
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
  
  // Navigation method added for clarity
  navigateToCompanies(): void {
    this.router.navigate(['/companies']);
  }
}