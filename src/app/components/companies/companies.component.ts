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
  
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
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
  activeTab: 'general' | 'address' | 'contacts' | 'notes' = 'general';

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
          this.filteredCompanies = [...this.companies];
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
      return;
    }
    
    const search = this.searchTerm.toLowerCase();
    this.filteredCompanies = this.companies.filter(company => 
      company.name.toLowerCase().includes(search) || 
      company.industry?.toLowerCase().includes(search) ||
      company.location?.toLowerCase().includes(search)
    );
  }

  // Company detail methods
  openCompanyDetail(company: Company): void {
    // Get fresh data for the company
    this.loading = true;
    
    this.companyService.getCompany(company.id)
      .subscribe({
        next: (companyData) => {
          this.selectedCompany = companyData;
          this.isCompanyDetailVisible = true;
          this.viewMode = 'detail';
          this.activeTab = 'general';
          this.detailViewActive.emit(true);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load company details. Please try again later.';
          this.loading = false;
          console.error('Error loading company details:', err);
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
  
  setActiveTab(tab: 'general' | 'address' | 'contacts' | 'notes'): void {
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
      website: ''
    };
  }
}