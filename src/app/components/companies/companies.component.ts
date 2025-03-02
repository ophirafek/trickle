import { Component, OnInit } from '@angular/core';
import { Company } from '../../../model/types';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  searchTerm: string = '';

  // Company detail
  selectedCompany: Company | null = null;
  isCompanyDetailOpen: boolean = false;
  
  // Import functionality
  isImportOpen: boolean = false;

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
    this.selectedCompany = company;
    this.isCompanyDetailOpen = true;
  }
  
  createNewCompany(): void {
    this.selectedCompany = null; // Null indicates a new company
    this.isCompanyDetailOpen = true;
  }
  
  closeCompanyDetail(): void {
    this.isCompanyDetailOpen = false;
    this.selectedCompany = null;
  }
  
  saveCompany(company: Company): void {
    // Find if this company already exists
    const existingIndex = this.companies.findIndex(c => c.name === company.name);
    
    if (existingIndex >= 0) {
      // Update existing company
      this.companies[existingIndex] = company;
    } else {
      // Add new company
      this.companies.push(company);
    }
    
    // In a real app, would call the data service to persist changes
    // this.dataService.saveCompany(company);
    
    // Refresh the view
    this.filterCompanies();
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
}
