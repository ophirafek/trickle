// src/app/components/companies/companies.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ThemePalette } from '@angular/material/core';
import { Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { GeneralCodeService } from '../../services/general-codes.service';
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
  
  // Define displayed columns for the new company model
  displayedColumns: string[] = ['registrationName', 'registrationNumber', 'businessField', 'country', 'status', 'website', 'actions'];
  
  Math = Math;
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  pagedCompanies: Company[] = []; // Companies on the current page
  searchTerm: string = '';

  // Filters
  filters: any = {
    registrationName: '',
    registrationNumber: '',
    countryCode: '',
    businessFieldCode: '',
    companyStatusCode: '',
    entityTypeCode: '',
    valueMin: '',
    valueMax: ''
  };

  // Loading and error state
  loading: boolean = false;
  error: string | null = null;
  
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Filter display toggle
  showFilters: boolean = true;
  
  // Code tables
  statusCodes: any[] = [];
  businessFieldCodes: any[] = [];
  entityTypeCodes: any[] = [];
  countryCodes: any[] = [];
  idTypeCodes: any[] = [];
  
  // Language code for localized data
  currentLanguageCode: number = 1; // Default to English (1)

  constructor(
    private companyService: CompanyService,
    private generalCodeService: GeneralCodeService,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupLanguage();
    this.loadCodeTables();
    this.loadCompanies();
  }
  
  setupLanguage(): void {
    // Set the current language code based on the active language
    const languageMap: { [key: string]: number } = {
      'en': 1, // English
      'he': 2  // Hebrew
      // Add more languages as needed
    };
    
    const currentLang = this.translocoService.getActiveLang();
    this.currentLanguageCode = languageMap[currentLang] || 1; // Default to 1 if not found
  }
  
  loadCodeTables(): void {
    // Load all required code tables
    this.generalCodeService.getStatusCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.statusCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading status codes:', err);
        }
      });
      
    this.generalCodeService.getBusinessFieldCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.businessFieldCodes = codes.filter(code => code.isActive);
        },
        error: (err : Error) => {
          console.error('Error loading business field codes:', err);
        }
      });
      
    this.generalCodeService.getEntityTypeCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.entityTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading entity type codes:', err);
        }
      });
      
    this.generalCodeService.getCountryCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.countryCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading country codes:', err);
        }
      });
      
    this.generalCodeService.getIdTypeCodes(this.currentLanguageCode)
      .subscribe({
        next: (codes) => {
          this.idTypeCodes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading ID type codes:', err);
        }
      });
  }
  
  ngAfterViewInit() {
    // Set up sorting and pagination after view initialization
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sort for complex columns if needed
    this.dataSource.sortingDataAccessor = (company, property) => {
      switch(property) {
        case 'registrationName': return company.registrationName || '';
        case 'registrationNumber': return company.registrationNumber || '';
        case 'businessField': return company.businessFieldCode.toString() || '';
        case 'country': return company.countryCode.toString() || '';
        case 'status': return company.companyStatusCode.toString() || '';
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
    // If no filters are applied, return all companies
    const hasActiveFilters = Object.values(this.filters).some(value => value !== '' && value !== null && value !== undefined);
    
    if (!hasActiveFilters) {
      this.filteredCompanies = [...this.companies];
    } else {
      this.filteredCompanies = this.companies.filter(company => {
        // Check name filter
        if (this.filters.registrationName && 
            !company.registrationName.toLowerCase().includes(this.filters.registrationName.toLowerCase())) {
          return false;
        }
        
        // Check registration number filter
        if (this.filters.registrationNumber && 
            !company.registrationNumber.toLowerCase().includes(this.filters.registrationNumber.toLowerCase())) {
          return false;
        }
        
        // Check country filter
        if (this.filters.countryCode && 
            company.countryCode !== parseInt(this.filters.countryCode)) {
          return false;
        }
        
        // Check business field filter
        if (this.filters.businessFieldCode && 
            company.businessFieldCode !== parseInt(this.filters.businessFieldCode)) {
          return false;
        }
        
        // Check status filter
        if (this.filters.companyStatusCode && 
            company.companyStatusCode !== parseInt(this.filters.companyStatusCode)) {
          return false;
        }
        
        // Check entity type filter
        if (this.filters.entityTypeCode && 
            company.entityTypeCode !== parseInt(this.filters.entityTypeCode)) {
          return false;
        }
        
        return true;
      });
    }
    
    // Update the data source
    this.dataSource.data = this.filteredCompanies;
    
    // Reset to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
    
    this.updatePagination();
  }

  applyFilters(): void {
    this.filterCompanies();
  }

  clearFilters(): void {
    this.filters = {
      registrationName: '',
      registrationNumber: '',
      countryCode: '',
      businessFieldCode: '',
      companyStatusCode: '',
      entityTypeCode: '',
      valueMin: '',
      valueMax: ''
    };
    this.filterCompanies();
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
      idTypeCode: 0, // Default ID type code
      registrationNumber: '',
      dunsNumber: '',
      vatNumber: '',
      registrationName: '',
      tradeName: '',
      englishName: '',
      companyStatusCode: 1, // Default to 'Active'
      businessFieldCode: 0,
      entityTypeCode: 0,
      foundingYear: 0,
      countryCode: 0,
      website: '',
      streetAddress: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      phoneNumber: '',
      mobileNumber: '',
      faxNumber: '',
      emailAddress: '',
      remarks: '',
      lastReportName: '',
      openingRef: '',
      closingRef: '',
      assignedTeamMemberId: 0,
      assignedTeamMemberName: '',
      contacts: [],
      notes: []
    };
  }
  
  // Get color for status chip based on company status code
  getStatusColor(statusCode: number): ThemePalette {
    switch(statusCode) {
      case 1: return 'primary'; // Active
      case 2: return 'accent';  // Prospect
      case 3: return undefined; // Inactive (grey)
      default: return 'primary';
    }
  }
  
  // Get code description by code number from a code table
  getCodeDescription(codes: any[], codeNumber: number): string {
    if (!codeNumber || !codes || !codes.length) return 'N/A';
    
    const code = codes.find(c => c.codeNumber === codeNumber);
    return code ? code.codeShortDescription : 'N/A';
  }
  
  // Get status text from status code
  getStatusText(statusCode: number): string {
    return this.getCodeDescription(this.statusCodes, statusCode);
  }
  
  // Get business field text from business field code
  getBusinessFieldText(businessFieldCode: number): string {
    return this.getCodeDescription(this.businessFieldCodes, businessFieldCode);
  }
  
  // Get country text from country code
  getCountryText(countryCode: number): string {
    return this.getCodeDescription(this.countryCodes, countryCode);
  }
  
  // Ensure website URLs have http prefix
  ensureHttpPrefix(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  openCompanyDetail(company: Company): void {
    this.router.navigate(['/companies', company.id]);
  }
}