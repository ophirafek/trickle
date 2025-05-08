import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ThemePalette } from '@angular/material/core';
import { Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEncapsulation } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CompaniesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Material table data source
  dataSource = new MatTableDataSource<Company>([]);
  
  // Define displayed columns
  displayedColumns: string[] = ['name', 'industry', 'size', 'location', 'status', 'website', 'actions'];
  
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
    private translocoService: TranslocoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }
  
  ngAfterViewInit() {
    // Set up sorting and pagination after view initialization
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sort for complex columns if needed
    this.dataSource.sortingDataAccessor = (company, property) => {
      switch(property) {
        case 'name': return company.name || '';
        case 'industry': return company.industry || '';
        case 'size': return company.size || '';
        case 'location': return company.location || '';
        case 'status': return company.status || 'Active';
        case 'website': return company.website || '';
        default: return (company as any)[property];
      }
    };
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
          this.error = this.translocoService.translate('COMPANIES.LOAD_ERROR');
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
    
    // Update the data source
    this.dataSource.data = this.filteredCompanies;
    
    // Reset to first page when filtering
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
  }
  
  // Handle pagination events from mat-paginator
  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.updatePagination();
  }

  deleteCompany(id: number): void {
    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
      this.loading = true;
      
      this.companyService.deleteCompany(id)
        .subscribe({
          next: () => {
            // Refresh the companies list
            this.loadCompanies();
            this.loading = false;
            
            this.snackBar.open(
              this.translocoService.translate('COMPANIES.DELETE_SUCCESS'), 
              this.translocoService.translate('BUTTONS.CLOSE'), 
              {
                duration: 3000,
                panelClass: ['success-snackbar']
              }
            );
          },
          error: (err) => {
            this.error = this.translocoService.translate('COMPANIES.DELETE_ERROR');
            this.loading = false;
            console.error('Error deleting company:', err);
            
            this.snackBar.open(
              this.translocoService.translate('COMPANIES.DELETE_FAILED'), 
              this.translocoService.translate('BUTTONS.CLOSE'), 
              {
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
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
      registrationNumber: '',
      dunsNumber: '',
      contacts: [],
      notes: []
    };
  }
  
  // Get color for status chip
  getStatusColor(status: string | undefined): ThemePalette {
    if (!status) return 'primary';
    
    switch(status.toLowerCase()) {
      case 'active': return 'primary';
      case 'prospect': return 'accent';
      case 'inactive': return undefined; // grey
      default: return 'primary';
    }
  }
  
  // Ensure website URLs have http prefix
  ensureHttpPrefix(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
  }
}