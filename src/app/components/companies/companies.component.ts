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
import { translate, TranslocoService } from '@ngneat/transloco';
import { GeneralCodeService, GeneralCode } from '../../services/general-codes.service';

interface EntityTypeCode {
  code: number;
  value: string;
  label: string;
  icon: string;
  color: string; // For styling
}

// Add these constants to your class




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
  displayedColumns: string[] = [
    'name', 
    'registrationInfo', 
    'businessType', 
    'status', 
    'entityType',
    'exposure', // New column
    'actions'
  ];
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
  
  // Status Codes - new field
  statusCodes: GeneralCode[] = [];
  selectedStatusCode: number | null = null;
  readonly ENTITY_TYPES: EntityTypeCode[] = [
    { 
      code: 1, 
      value: 'isInsured', 
      label: 'COMPANY_DETAIL.ENTITY_TYPES.INSURED', 
      icon: 'security',
      color: 'primary' // blue
    },
    { 
      code: 2, 
      value: 'isDebtor', 
      label: 'COMPANY_DETAIL.ENTITY_TYPES.DEBTOR', 
      icon: 'account_balance',
      color: 'warn' // red
    },
    { 
      code: 3, 
      value: 'isPotentialClient', 
      label: 'COMPANY_DETAIL.ENTITY_TYPES.POTENTIAL_CLIENT', 
      icon: 'person_add',
      color: 'accent' // teal
    },
    { 
      code: 4, 
      value: 'isAgent', 
      label: 'COMPANY_DETAIL.ENTITY_TYPES.AGENT', 
      icon: 'support_agent',
      color: 'agent-chip' // purple (custom)
    }
  ];
  selectedEntityTypeCodes: number[] = [];  // Advanced filters toggle
  showAdvancedFilters: boolean = false;
// Add these properties for the exposure filter
  minExposure: number | null = null;
  maxExposure: number | null = null;
  selectedCurrencyCode: number | null = null;
  currencies: GeneralCode[] = [];

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
    this.loadStatusCodes(); // Load status codes
    this.loadCurrencies(); // Add this line
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
        case 'status': return this.getStatusName(company.companyStatusCode) || '';
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
    
    this.generalCodeService.getCodesByType(20, languageCode) // Code type 20 for business types
      .subscribe({
        next: (businessTypes) => {
          this.businessTypes = businessTypes.filter(businessType => businessType.isActive);
          console.log('Business Types loaded:', this.businessTypes.length);
        },
        error: (err) => {
          console.error('Error loading business types:', err);
        }
      });
  }
  
  // New method to load status codes
  loadStatusCodes() {
    const currentLang = this.translocoService.getActiveLang();
    // Map the language code to a numeric code for the API
    const languageCode = currentLang === 'he' ? 2 : 1;
    
    this.generalCodeService.getCodesByType(15, languageCode) // Code type 15 for company status codes
      .subscribe({
        next: (statusCodes) => {
          this.statusCodes = statusCodes.filter(statusCode => statusCode.isActive);
          console.log('Status Codes loaded:', this.statusCodes.length);
        },
        error: (err) => {
          console.error('Error loading status codes:', err);
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
          this.companies = companies.map(company => {
                      // Create a random set of entity types
            const isInsured = Math.random() > 0.7;
            const isDebtor = Math.random() > 0.8;
            const isPotentialClient = Math.random() > 0.6;
            const isAgent = Math.random() > 0.9;
            
            // Calculate entity types array based on the boolean flags
            const entityTypeCodes: number[] = [];
            if (isInsured) entityTypeCodes.push(1);  // Code for isInsured
            if (isDebtor) entityTypeCodes.push(2);   // Code for isDebtor
            if (isPotentialClient) entityTypeCodes.push(3); // Code for isPotentialClient
            if (isAgent) entityTypeCodes.push(4);    // Code for isAgent
                  // Add random exposure data for demonstration
          // Generate a random amount between 10,000 and 10,000,000
          const exposure = Math.random() > 0.1 ? Math.floor(Math.random() * 9990000) + 10000 : 0;
          
          // Randomly assign a currency code between 1-5 (assuming your general codes)
          // This would be replaced with actual currency codes from your API
          const currencyCode = exposure ? Math.floor(Math.random() * 5) + 1 : 0;
            // Return the company with entity flags and codes
            return {
              ...company,
              isInsured,
              isDebtor,
              isPotentialClient,
              isAgent,
              entityTypeCodes,
              exposure,
              currencyCode  // Add this array of codes for future use
            };
          });
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
        company.registrationName.toLowerCase().includes(search) 
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
    
    // Filter by selected status code if provided
    if (this.selectedStatusCode !== null) {
      results = results.filter(company => 
        company.companyStatusCode === this.selectedStatusCode
      );
    }
    // NEW: Filter by selected entity types if any are selected
    if (this.selectedEntityTypeCodes.length > 0) {
      results = results.filter(company => {
        // A company should be included if it matches ANY of the selected entity types
        return this.selectedEntityTypeCodes.some(code => {
          const entityType = this.getEntityTypeByCode(code);
          return entityType && company[entityType.value as keyof Company] === true;
        });
      });
    }
     // Filter by min exposure if provided
  if (this.minExposure !== null) {
    results = results.filter(company => 
      company.exposure !== null && company.exposure !== undefined && company.exposure >= this.minExposure!
    );
  }
  
  // Filter by max exposure if provided
  if (this.maxExposure !== null) {
    results = results.filter(company => 
      company.exposure !== null && company.exposure !== undefined && company.exposure <= this.maxExposure!
    );
  }
  
  // Filter by currency code if provided
  if (this.selectedCurrencyCode !== null) {
    results = results.filter(company => 
      company.currencyCode === this.selectedCurrencyCode
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
      companyStatusCode: 1, // Default status code for Active
      registrationNumber: '',
      dunsNumber: '',
      contacts: [],
      notes: []
    };
  }
  
  // Get color for status chip
  getStatusColor(statusCode?: number): ThemePalette {
    if (!statusCode) return 'primary';
    
    // Map status codes to appropriate colors
    // This can be customized based on your specific status codes
    switch(statusCode) {
      case 1: return 'primary'; // Assuming 1 is Active
      case 2: return 'accent';  // Assuming 2 is Prospect
      case 3: return 'warn'; // Assuming 3 is Inactive (grey)
      default: return 'primary';
    }
  }
  
  // New method to get status name by code
  getStatusName(statusCode?: number): string {
    if (!statusCode) return '';
    
    const status = this.statusCodes.find(status => status.codeNumber === statusCode);
    return status ? status.codeShortDescription : '';
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
    this.selectedStatusCode = null;
    this.selectedEntityTypeCodes = [];
    this.minExposure = null;
    this.maxExposure = null;
    this.selectedCurrencyCode = null;
    this.filterCompanies();
  }
  
  // Check if any filters are applied
  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm.trim() || 
      this.primaryIdSearchTerm.trim() || 
      this.selectedCountry || 
      this.selectedBusinessTypeCode || 
      this.selectedStatusCode || 
      this.selectedEntityTypeCodes.length > 0 ||
      this.minExposure !== null ||
      this.maxExposure !== null ||
      this.selectedCurrencyCode !== null
    );
  }
  
  // Get Business Type name by code
  getBusinessTypeName(businessTypeCode?: number): string {
    if (!businessTypeCode) return '';
    
    const businessType = this.businessTypes.find(type => type.codeNumber === businessTypeCode);
    return businessType ? businessType.codeShortDescription : '';
  }
  // Add helper method to get entity type by code
getEntityTypeByCode(code: number): EntityTypeCode | undefined {
  return this.ENTITY_TYPES.find(entityType => entityType.code === code);
}
  // Add helper method to get entity type by value
getEntityTypeByValue(value: string): EntityTypeCode | undefined {
  return this.ENTITY_TYPES.find(entityType => entityType.value === value);
}

// Helper method to get entity color by value
getEntityTypeColor(value: string): string {
  const entityType = this.getEntityTypeByValue(value);
  return entityType ? entityType.color : 'primary';
}
loadCurrencies() {
  const currentLang = this.translocoService.getActiveLang();
  // Map the language code to a numeric code for the API
  const languageCode = currentLang === 'he' ? 2 : 1; // Assuming 1 for English, 2 for Hebrew
  
  this.generalCodeService.getCodesByType(26, languageCode) // Code type 25 for currencies
    .subscribe({
      next: (currencies) => {
        this.currencies = currencies.filter(currency => currency.isActive);
        console.log('Currencies loaded:', this.currencies.length);
      },
      error: (err) => {
        console.error('Error loading currencies:', err);
      }
    });
}

// Add method to get currency symbol
getCurrencySymbol(currencyCode?: number): string {
  if (!currencyCode) return '';
  
  const currency = this.currencies.find(curr => curr.codeNumber === currencyCode);
  return currency ? currency.codeShortDescription : '';
}

}