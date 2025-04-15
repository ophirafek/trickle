import { Component, OnInit, ViewChild, Output, EventEmitter, Input, ElementRef, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { CompanyDetailComponent } from '../company-detail/company-detail.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeadService } from '../../services/lead.service';
import { Lead } from '../../../model/types';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
  encapsulation: ViewEncapsulation.None  // This helps with styling nested Material components
})
export class CompaniesComponent implements OnInit {
  @ViewChild('companyDetailComponent') companyDetailComponent!: CompanyDetailComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() detailViewActive = new EventEmitter<boolean>();
  @Input() showContextMenu: boolean = false;
  
  Math = Math;
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  pagedCompanies: Company[] = []; // Companies on the current page
  searchTerm: string = '';

  // Loading and error state
  loading: boolean = false;
  error: string | null = null;

  // Company detail
  selectedCompany: Company | null = null;
  isCompanyDetailVisible: boolean = false;
  
  // Import functionality
  isImportOpen: boolean = false;
  
  // View state
  viewMode: 'list' | 'detail' = 'list';
  activeTab: 'general' | 'address' | 'contacts' | 'notes' | 'leads' = 'general';
  
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  companyLeads: Lead[] = [];
  leadError: string | null = null;
  leadLoading: boolean = false;

  constructor(
    private companyService: CompanyService,
    private leadService: LeadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.error = null;
    
    this.companyService.getCompanies()
      .subscribe({
        next: (companies) => {
          this.companies = companies;
          this.filterCompanies();
          this.loading = false;
          console.log('Companies loaded:', this.companies.length);
        },
        error: (err) => {
          this.error = 'Failed to load companies. Please try again later.';
          this.loading = false;
          console.error('Error loading companies:', err);
        }
      });
  }

  filterCompanies(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCompanies = [...this.companies];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredCompanies = this.companies.filter(company => 
        company.name.toLowerCase().includes(search) || 
        (company.industry && company.industry.toLowerCase().includes(search)) ||
        (company.location && company.location.toLowerCase().includes(search))
      );
    }
    
    // Reset to first page when filtering
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    
    this.updatePagination();
    console.log('Filtered companies:', this.filteredCompanies.length);
  }
  
  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredCompanies.length / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    // Get companies for current page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedCompanies = this.filteredCompanies.slice(startIndex, startIndex + this.pageSize);
    console.log('Page companies:', this.pagedCompanies.length);
  }
  
  // Pagination controls
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  // Get an array of page numbers for pagination UI
  get pageNumbers(): number[] {
    const pageArray: number[] = [];
    
    // Show 5 page numbers centered around current page when possible
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageArray.push(i);
    }
    
    return pageArray;
  }

  // Company detail methods
  openCompanyDetail(company: Company): void {
    console.log('Opening company detail for:', company.name);
    // Get fresh data for the company
    this.loading = true;
    
    this.companyService.getCompany(company.id)
      .subscribe({
        next: (companyData) => {
          console.log('Company data loaded:', companyData);
          this.selectedCompany = companyData;
          this.isCompanyDetailVisible = true;
          this.viewMode = 'detail';
          this.activeTab = 'general';
          this.detailViewActive.emit(true);
          this.loading = false;
          
          // Add delay to ensure DOM updates
          setTimeout(() => {
            console.log('Detail view state:', {
              isCompanyDetailVisible: this.isCompanyDetailVisible,
              viewMode: this.viewMode,
              companyDetailVisible: document.querySelector('app-company-detail') !== null
            });
          }, 100);
        },
        error: (err) => {
          console.error('Error loading company details:', err);
          this.error = 'Failed to load company details. Please try again later.';
          this.loading = false;
          
          this.snackBar.open('Error loading company details', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  createNewCompany(): void {
    this.selectedCompany = null; // Null indicates a new company
    this.isCompanyDetailVisible = true;
    this.viewMode = 'detail';
    this.activeTab = 'general';
    this.detailViewActive.emit(true);
  }
  
  closeCompanyDetail(): void {
    this.isCompanyDetailVisible = false;
    this.selectedCompany = null;
    this.viewMode = 'list';
    this.detailViewActive.emit(false);
  }
  
setActiveTab(tab: 'general' | 'address' | 'contacts' | 'notes' | 'leads'): void {
  this.activeTab = tab;
  
  // Load leads data if the leads tab is selected
}
  
  onSaveCompany(): void {
    // Access the edited company from the child component
    if (this.companyDetailComponent) {
      console.log('Company detail component found, getting edited company');
      const company = this.companyDetailComponent.editingCompany;
      this.saveCompany(company);
    } else {
      console.error('Company detail component not found');
      this.snackBar.open('Cannot access company details', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  saveCompany(company: Company): void {
    if (!company || !company.name.trim()) {
      this.error = 'Company name is required';
      this.snackBar.open('Company name is required', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    console.log('Saving company:', company);
    
    // Ensure collections are initialized
    if (!company.contacts) company.contacts = [];
    if (!company.notes) company.notes = [];
    
    if (this.selectedCompany && this.selectedCompany.id) {
      // Update existing company
      console.log('Updating existing company with ID:', this.selectedCompany.id);
      this.companyService.updateCompany(this.selectedCompany.id, company)
        .subscribe({
          next: () => {
            console.log('Company updated successfully');
            // Refresh the companies list
            this.loadCompanies();
            
            // Return to list view
            this.viewMode = 'list';
            this.isCompanyDetailVisible = false;
            this.detailViewActive.emit(false);
            this.loading = false;
            
            this.snackBar.open('Company updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            this.error = 'Failed to update company. Please try again later.';
            this.loading = false;
            console.error('Error updating company:', err);
            
            this.snackBar.open('Failed to update company', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      // Create new company
      console.log('Creating new company');
      this.companyService.createCompany(company)
        .subscribe({
          next: (newCompany) => {
            console.log('Company created successfully:', newCompany);
            // Refresh the companies list
            this.loadCompanies();
            
            // Return to list view
            this.viewMode = 'list';
            this.isCompanyDetailVisible = false;
            this.detailViewActive.emit(false);
            this.loading = false;
            
            this.snackBar.open('Company created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            this.error = 'Failed to create company. Please try again later.';
            this.loading = false;
            console.error('Error creating company:', err);
            
            this.snackBar.open('Failed to create company', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
  
  deleteCompany(id: number): void {
    if (confirm('Are you sure you want to delete this company?')) {
      this.loading = true;
      
      this.companyService.deleteCompany(id)
        .subscribe({
          next: () => {
            // Refresh the companies list
            this.loadCompanies();
            this.loading = false;
            
            this.snackBar.open('Company deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            this.error = 'Failed to delete company. Please try again later.';
            this.loading = false;
            console.error('Error deleting company:', err);
            
            this.snackBar.open('Failed to delete company', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
  
  // Import methods
  openImport(): void {
    this.isImportOpen = true;
  }
  
  closeImport(): void {
    this.isImportOpen = false;
  }
  
  handleImportedCompanies(importedCompanies: Company[]): void {
    if (!importedCompanies || importedCompanies.length === 0) return;
    
    // Counter for successful imports
    let successCount = 0;
    this.loading = true;
    
    // Process each company sequentially
    const processCompany = (index: number) => {
      if (index >= importedCompanies.length) {
        // All companies processed, refresh the list
        this.loadCompanies();
        this.loading = false;
        
        // Show success message
        this.snackBar.open(`Successfully imported ${successCount} companies`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        return;
      }
      
      const company = importedCompanies[index];
      
      // Ensure collections are initialized
      if (!company.contacts) company.contacts = [];
      if (!company.notes) company.notes = [];
      
      // Check if company already exists by name
      const existingCompany = this.companies.find(c => c.name === company.name);
      
      if (existingCompany) {
        // Update existing company
        this.companyService.updateCompany(existingCompany.id, {...existingCompany, ...company})
          .subscribe({
            next: () => {
              successCount++;
              // Process next company
              processCompany(index + 1);
            },
            error: (err) => {
              console.error('Error updating company during import:', err);
              // Continue with next company despite errors
              processCompany(index + 1);
            }
          });
      } else {
        // Create new company
        this.companyService.createCompany(company)
          .subscribe({
            next: () => {
              successCount++;
              // Process next company
              processCompany(index + 1);
            },
            error: (err) => {
              console.error('Error creating company during import:', err);
              // Continue with next company despite errors
              processCompany(index + 1);
            }
          });
      }
    };
    
    // Start processing companies
    processCompany(0);
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
  // Add this method to your CompaniesComponent class

// Handle pagination events from mat-paginator
onPageChange(event: any): void {
  this.pageSize = event.pageSize;
  this.currentPage = event.pageIndex + 1;
  this.updatePagination();
}
}