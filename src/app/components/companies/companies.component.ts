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
import { GeneralCodeService, GeneralCode } from '../../services/general-codes.service';

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
  displayedColumns: string[] = ['name', 'registrationInfo', 'businessType', 'industry', 'status', 'actions'];
  
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
  primaryIdSearchTerm: string = '';
  
  // Country filter
  countries: GeneralCode[] = [];
  selectedCountry: string = '';
  
  // ID Types for registration numbers
  idTypes: GeneralCode[] = [];
  
  // Business Types
  businessTypes: GeneralCode[] = [];
  selectedBusinessTypeCode: number | null = null;
  
  // Advanced filters toggle
  showAdvancedFilters: boolean = false;

  constructor(
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService,
    private generalCodeService: GeneralCodeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadCountries();
    this.loadIdTypes();
    this.loadBusinessTypes();
  }
  
  ngAfterViewInit() {
    // Set up sorting and pagination after view initialization
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sort for complex columns if needed
    this.dataSource.sortingDataAccessor = (company, property) => {
      switch(property) {
        case 'name': return company.registrationName || '';
        case 'registrationInfo': return company.registrationNumber || '';
        case 'businessType': return this.getBusinessTypeName(company.businessFieldCode) || '';
        case 'industry': return company.industry || '';
        case 'status': return company.status || 'Active';
        default: return (company as any)[property];
      }
    };
  }

  loadCountries() {
    // Get the current language code from TranslocoService
    const currentLang = this.translocoService.getActiveLang();
    // Map the language code to a numeric code for the API
    const languageCode = currentLang === 'he' ? 2 : 1; // Assuming 1 for English, 2 for Hebrew
    
    this.generalCodeService.getCodesByType(25, languageCode)
      .subscribe({
        next: (countries) => {
          this.countries = countries.filter(country => country.isActive);
          console.log('Countries loaded:', this.countries.length);
        },
        error: (err) => {
          console.error('Error loading countries:', err);
        }
      });
  }

  loadIdTypes() {
    // Get the current language code from TranslocoService
    const currentLang = this.translocoService.getActiveLang();
    // Map the language code to a numeric code for the API
    const languageCode = currentLang === 'he' ? 2 : 1; // Assuming 1 for English, 2 for Hebrew
    
    this.generalCodeService.getCodesByType(10, languageCode) // Assuming 10 is the ID Type code
      .subscribe({
        next: (idTypes) => {
          this.idTypes = idTypes.filter(idType => idType.isActive);
          console.log('ID Types loaded:', this.idTypes.length);
        },
        error: (err) => {
          console.error('Error loading ID types:', err);
        }
      });
  }
  loadBusinessTypes() {
    const currentLang = this.translocoService.getActiveLang();
    // Map the language code to a numeric code for the API
    const languageCode = currentLang === 'he' ? 2 : 1; // Assuming 1 for English, 2 for Hebrew
    
    this.generalCodeService.getCodesByType(20, languageCode) // Assuming 10 is the ID Type code
      .subscribe({
        next: (businessTypes) => {
          this.businessTypes = businessTypes.filter(businessType => businessType.isActive);
          console.log('Business Types loaded:', this.businessTypes.length);
        },
        error: (err) => {
          console.error('Error loading ID types:', err);
        }
      });

  }
  // Get ID Type name by code
  getIdTypeName(idTypeCode?: number): string {
    if (!idTypeCode) return '';
    
    const idType = this.idTypes.find(type => type.codeNumber === idTypeCode);
    return idType ? idType.codeShortDescription : '';
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
    // Start with all companies
    let results = [...this.companies];
    
    // Filter by search term if provided
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      results = results.filter(company => 
        company.registrationName.toLowerCase().includes(search) || 
        (company.industry && company.industry.toLowerCase().includes(search)) ||
        (company.location && company.location.toLowerCase().includes(search))
      );
    }
    
    // Filter by primary ID if provided
    if (this.primaryIdSearchTerm.trim()) {
      const idSearch = this.primaryIdSearchTerm.toLowerCase();
      results = results.filter(company => 
        (company.registrationNumber && company.registrationNumber.toLowerCase().includes(idSearch)) ||
        (company.dunsNumber && company.dunsNumber.toLowerCase().includes(idSearch))
      );
    }
    
    // Filter by selected country if provided
    if (this.selectedCountry) {
      results = results.filter(company => 
        company.country === this.selectedCountry
      );
    }
    
    // Filter by selected business type if provided
    if (this.selectedBusinessTypeCode !== null) {
      results = results.filter(company => 
        company.businessFieldCode === this.selectedBusinessTypeCode
      );
    }
    
    this.filteredCompanies = results;
    
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
      registrationName: '',
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
  
  // Toggle advanced filters section
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
  
  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.primaryIdSearchTerm = '';
    this.selectedCountry = '';
    this.selectedBusinessTypeCode = null;
    this.filterCompanies();
  }
  
  // Check if any filters are applied
  hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.primaryIdSearchTerm.trim() || this.selectedCountry || this.selectedBusinessTypeCode);
  }
  // Get Business Type name by code
getBusinessTypeName(businessTypeCode?: number): string {
  if (!businessTypeCode) return '';
  
  const businessType = this.businessTypes.find(type => type.codeNumber === businessTypeCode);
  return businessType ? businessType.codeShortDescription : '';
}
}