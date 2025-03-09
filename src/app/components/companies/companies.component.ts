import { Component, OnInit, ViewChild } from '@angular/core';
import { Company } from '../../../model/types';
import { DataService } from '../../services/data.service';
import { CompanyDetailComponent } from '../company-detail/company-detail.component';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  @ViewChild(CompanyDetailComponent) companyDetailComponent!: CompanyDetailComponent;
  
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  searchTerm: string = '';

  // Company detail
  selectedCompany: Company | null = null;
  isCompanyDetailVisible: boolean = false;
  
  // Import functionality
  isImportOpen: boolean = false;
  
  // View state
  viewMode: 'list' | 'detail' = 'list';
  activeTab: 'general' | 'address' | 'contacts' | 'notes' = 'general';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.companies = this.dataService.getCompanies();
    this.filteredCompanies = [...this.companies];
  }

  filterCompanies(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCompanies = [...this.companies];
      return;
    }
    
    const search = this.searchTerm.toLowerCase();
    this.filteredCompanies = this.companies.filter(company => 
      company.name.toLowerCase().includes(search) || 
      company.industry.toLowerCase().includes(search) ||
      company.location.toLowerCase().includes(search)
    );
  }

  // Company detail methods
  openCompanyDetail(company: Company): void {
    this.selectedCompany = { ...company };
    this.isCompanyDetailVisible = true;
    this.viewMode = 'detail';
    this.activeTab = 'general';
  }
  
  createNewCompany(): void {
    this.selectedCompany = null; // Null indicates a new company
    this.isCompanyDetailVisible = true;
    this.viewMode = 'detail';
    this.activeTab = 'general';
  }
  
  closeCompanyDetail(): void {
    this.isCompanyDetailVisible = false;
    this.selectedCompany = null;
    this.viewMode = 'list';
  }
  
  setActiveTab(tab: 'general' | 'address' | 'contacts' | 'notes'): void {
    this.activeTab = tab;
  }
  
  onSaveCompany(): void {
    // Access the edited company from the child component
    // The component might not be initialized immediately, so we need to check
    if (this.companyDetailComponent) {
      const company = this.companyDetailComponent.editingCompany;
      this.saveCompany(company);
    }
  }
  
  saveCompany(company: Company): void {
    if (!company || !company.name.trim()) return;
    
    // Find if this company already exists
    const existingIndex = this.selectedCompany ? 
      this.companies.findIndex(c => c.name === this.selectedCompany?.name) :
      this.companies.findIndex(c => c.name === company.name);
    
    if (existingIndex >= 0) {
      // Update existing company
      this.companies[existingIndex] = { ...company };
    } else {
      // Add new company
      this.companies.push({ ...company });
    }
    
    // In a real app, would call the data service to persist changes
    // this.dataService.saveCompany(company);
    
    // Refresh the view
    this.filterCompanies();
    
    // Return to list view
    this.viewMode = 'list';
    this.isCompanyDetailVisible = false;
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
    
    // Add imported companies to our list
    importedCompanies.forEach(company => {
      // Check for duplicates by name
      const existingIndex = this.companies.findIndex(c => c.name === company.name);
      
      if (existingIndex >= 0) {
        // Update existing company
        this.companies[existingIndex] = {...this.companies[existingIndex], ...company};
      } else {
        // Add new company
        this.companies.push(company);
      }
    });
    
    // In a real app, would call the data service to persist changes
    // this.dataService.saveCompanies(this.companies);
    
    // Refresh the view and show success notification
    this.filterCompanies();
    
    // Show success message - in a real app, use a proper notification service
    alert(`Successfully imported ${importedCompanies.length} companies`);
  }
  
  getEmptyCompany(): Company {
    return {
      name: '',
      industry: '',
      size: '100-500 employees',
      location: '',
      website: ''
    };
  }
}