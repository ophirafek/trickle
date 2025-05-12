
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
  
  // Define displayed columns for the company model
  displayedColumns: string[] = [
    'registrationName', 
    'registrationNumber', 
    'country', 
    'businessField', 
    'status', 
    'entityType', 
    'obligatoryAmount', 
    'actions'
  ];
  
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  
  // UI state variables
  showFilters: boolean = true;
  showAdvancedFilters: boolean = false;
  
  // Filters
  filters: any = {
    registrationName: '',
    registrationNumber: '',
    countryCode: null,
    businessFieldCode: null,
    companyStatusCode: null,
    entityTypeCode: null,
    obligatoryMin: '',
    obligatoryMax: ''
  };

  // Loading and error state
  loading: boolean = false;
  error: string | null = null;
  
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
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
        error: (err) => {
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
    
    // Custom sort for complex columns
    this.dataSource.sortingDataAccessor = (company, property) => {
      switch(property) {
        case 'registrationName': return company.registrationName || '';
        case 'registrationNumber': return company.registrationNumber || '';
        case 'businessField': return this.getBusinessFieldText(company.businessFieldCode) || '';
        case 'country': return this.getCountryText(company.countryCode) || '';
        case 'status': return this.getStatusText(company.companyStatusCode) || '';
        case 'entityType': return this.getEntityTypeText(company.entityTypeCode) || '';
        case 'obligatoryAmount': return company.obligatoryAmount ? Number(company.obligatoryAmount) : 0;
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
          // Add obligatoryAmount property to match the React code structure
          this.companies = companies.map(company => ({
            ...company,
            obligatoryAmount: this.getRandomObligatoryAmount() // In real app, this would come from API
          }));
          this.filterCompanies();
          this.loading = false;
        },
        error: (err) => {
          this.error = this.translocoService.translate('COMPANIES.LOAD_ERROR');
          this.loading = false;
          console.error('Error loading companies:', err);
        }
      });
  }
  
  // Helper method to generate random obligatory amounts for demo purposes
  // In a real application, this would come from the API
  private getRandomObligatoryAmount(): number {
    return Math.floor(Math.random() * 500000) + 50000;
  }

  filterCompanies(): void {
    // If no filters are applied, return all companies
    let hasActiveFilters = false;
    for (const key in this.filters) {
      if (this.filters[key] !== '' && this.filters[key] !== null) {
        hasActiveFilters = true;
        break;
      }
    }
    
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
            company.countryCode !== this.filters.countryCode) {
          return false;
        }
        
        // Check business field filter
        if (this.filters.businessFieldCode && 
            company.businessFieldCode !== this.filters.businessFieldCode) {
          return false;
        }
        
        // Check status filter
        if (this.filters.companyStatusCode && 
            company.companyStatusCode !== this.filters.companyStatusCode) {
          return false;
        }
        
        // Check entity type filter
        if (this.filters.entityTypeCode && 
            company.entityTypeCode !== this.filters.entityTypeCode) {
          return false;
        }
        
        // Check obligatory min
        if (this.filters.obligatoryMin && 
            company.obligatoryAmount < Number(this.filters.obligatoryMin)) {
          return false;
        }
        
        // Check obligatory max
        if (this.filters.obligatoryMax && 
            company.obligatoryAmount > Number(this.filters.obligatoryMax)) {
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
      countryCode: null,
      businessFieldCode: null,
      companyStatusCode: null,
      entityTypeCode: null,
      obligatoryMin: '',
      obligatoryMax: ''
    };
    this.filterCompanies();
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
  
  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredCompanies.length / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }
  
  // Handle pagination events from mat-paginator
  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.updatePagination();
  }
  
  openCompanyDetail(company: Company): void {
    this.router.navigate(['/companies', company.id]);
  }
  
  // Format currency values
  formatCurrency(value: number | undefined): string {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
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
  
  // Get entity type text from entity type code
  getEntityTypeText(entityTypeCode: number): string {
    return this.getCodeDescription(this.entityTypeCodes, entityTypeCode);
  }
}
