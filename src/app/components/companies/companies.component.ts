import { Component, OnInit, ViewChild, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { CompanyDetailComponent } from '../company-detail/company-detail.component';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  @ViewChild('companyDetailComponent') companyDetailComponent!: CompanyDetailComponent;
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

  constructor(private companyService: CompanyService) {}

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
        company.industry?.toLowerCase().includes(search) ||
        company.location?.toLowerCase().includes(search)
      );
    }
    
    this.updatePagination();
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
  }
  
  onSaveCompany(): void {
    // Access the edited company from the child component
    if (this.companyDetailComponent) {
      console.log('Company detail component found, getting edited company');
      const company = this.companyDetailComponent.editingCompany;
      this.saveCompany(company);
    } else {
      console.error('Company detail component not found');
    }
  }
  
  saveCompany(company: Company): void {
    if (!company || !company.name.trim()) {
      this.error = 'Company name is required';
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
          },
          error: (err) => {
            this.error = 'Failed to update company. Please try again later.';
            this.loading = false;
            console.error('Error updating company:', err);
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
          },
          error: (err) => {
            this.error = 'Failed to create company. Please try again later.';
            this.loading = false;
            console.error('Error creating company:', err);
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
          },
          error: (err) => {
            this.error = 'Failed to delete company. Please try again later.';
            this.loading = false;
            console.error('Error deleting company:', err);
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
        alert(`Successfully imported ${successCount} companies`);
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
}