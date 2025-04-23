import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
  encapsulation: ViewEncapsulation.None  // This helps with styling nested Material components
})
export class CompaniesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  Math = Math;
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  pagedCompanies: Company[] = []; // Companies on the current page
  searchTerm: string = '';

  // Loading and error state
  loading: boolean = false;
  error: string | null = null;
  
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private router: Router
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
  // Handle pagination events from mat-paginator
  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.updatePagination();
  }
}