// company-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Company, CompanyFilter } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  allCompanies: Company[] = [];
  companies: Company[] = [];
  filterForm: FormGroup;
  showFilters = true;
  showAdvancedFilters = false;
  displayedColumns: string[] = [
    'registrationName', 
    'primaryId', 
    'country', 
    'businessField', 
    'status', 
    'entityType', 
    'obligatoryAmount', 
    'actions'
  ];

  countries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'France'];
  businessFields = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Business Services'];
  companyStatuses = ['Active', 'Inactive', 'On Hold'];
  entityTypes = ['debtor', 'insured', 'potential'];

  constructor(
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.formBuilder.group({
      companyName: [''],
      primaryId: [''],
      country: [''],
      businessField: [''],
      companyStatus: [''],
      entityType: [''],
      obligatoryMin: [''],
      obligatoryMax: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    // In a real application, this would be an API call
    this.allCompanies = [
      { 
        id: 1,
        idTypeCode: 1,
        registrationNumber: 'REG-123456',
        dunsNumber: '',
        vatNumber: 'GB123456789',
        registrationName: 'Acme Global Solutions', 
        tradeName: 'Acme Solutions',
        englishName: 'Technology solutions provider',
        companyStatusCode: 1,
        businessFieldCode: 1,
        entityTypeCode: 1,
        countryCode: 1,
        website: 'https://www.acmeglobalsolutions.com',
        streetAddress: '123 Business Avenue',
        city: 'San Francisco',
        stateProvince: 'California',
        postalCode: '94105',
        phoneNumber: '+1 (555) 123-4567',
        mobileNumber: '+1 (555) 987-6543',
        faxNumber: '+1 (555) 123-4568',
        emailAddress: 'info@acmeglobalsolutions.com',
        remarks: 'Acme Global Solutions is a key client with strong growth potential. They are planning to expand to European markets in Q3 2025. Maintain regular contact with CEO John Smith.',
        obligatoryAmount: '$250,000',
        isDebtor: true,
        isInsuredCompany: true,
        isPotentialCustomer: false,
        isAgent: false
      },
      { 
        id: 2,
        idTypeCode: 2,
        registrationNumber: '',
        dunsNumber: '',
        vatNumber: 'GB987654321',
        registrationName: 'TechCorp International', 
        tradeName: 'TechCorp',
        englishName: 'Technology solutions provider',
        companyStatusCode: 1,
        businessFieldCode: 1,
        entityTypeCode: 2,
        countryCode: 2,
        website: 'https://www.techcorp.com',
        obligatoryAmount: '$175,000',
        isDebtor: false,
        isInsuredCompany: true,
        isPotentialCustomer: false,
        isAgent: false
      },
      { 
        id: 3,
        idTypeCode: 3,
        registrationNumber: '',
        dunsNumber: '456789123',
        vatNumber: '',
        registrationName: 'Global Manufacturing Ltd', 
        tradeName: 'Global Manufacturing',
        englishName: 'Manufacturing solutions provider',
        companyStatusCode: 2,
        businessFieldCode: 2,
        entityTypeCode: 3,
        countryCode: 3,
        website: 'https://www.globalmanufacturing.com',
        obligatoryAmount: '$100,000',
        isDebtor: false,
        isInsuredCompany: false,
        isPotentialCustomer: true,
        isAgent: false
      },
      { 
        id: 4,
        idTypeCode: 1,
        registrationNumber: 'REG-789123',
        dunsNumber: '',
        vatNumber: '',
        registrationName: 'Sunrise Healthcare', 
        tradeName: 'Sunrise',
        englishName: 'Healthcare provider',
        companyStatusCode: 1,
        businessFieldCode: 3,
        entityTypeCode: 4,
        countryCode: 4,
        website: 'https://www.sunrisehealthcare.com',
        obligatoryAmount: '$320,000',
        isDebtor: true,
        isInsuredCompany: false,
        isPotentialCustomer: true,
        isAgent: false
      },
      { 
        id: 5,
        idTypeCode: 3,
        registrationNumber: '',
        dunsNumber: '987321654',
        vatNumber: '',
        registrationName: 'Capital Finance Group', 
        tradeName: 'Capital Finance',
        englishName: 'Financial services provider',
        companyStatusCode: 3,
        businessFieldCode: 4,
        entityTypeCode: 5,
        countryCode: 1,
        website: 'https://www.capitalfinance.com',
        obligatoryAmount: '$500,000',
        isDebtor: true,
        isInsuredCompany: false,
        isPotentialCustomer: false,
        isAgent: false
      }
    ];
    this.companies = [...this.allCompanies];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.companies = [...this.allCompanies];
  }

  applyFilters(): void {
    const filters = this.filterForm.value as CompanyFilter;
    let filteredResults = [...this.allCompanies];
    
    // Filter by company name
    if (filters.companyName) {
      filteredResults = filteredResults.filter(company => 
        company.registrationName.toLowerCase().includes(filters.companyName.toLowerCase())
      );
    }
    
    // Filter by primary ID
    if (filters.primaryId) {
      filteredResults = filteredResults.filter(company => 
        (company.registrationNumber && company.registrationNumber.toLowerCase().includes(filters.primaryId.toLowerCase())) ||
        (company.vatNumber && company.vatNumber.toLowerCase().includes(filters.primaryId.toLowerCase())) ||
        (company.dunsNumber && company.dunsNumber.toLowerCase().includes(filters.primaryId.toLowerCase()))
      );
    }
    
    // Filter by country
    if (filters.country) {
      filteredResults = filteredResults.filter(company => 
        this.getCountryName(company.countryCode) === filters.country
      );
    }
    
    // Filter by business field
    if (filters.businessField) {
      filteredResults = filteredResults.filter(company => 
        this.getBusinessFieldName(company.businessFieldCode) === filters.businessField
      );
    }
    
    // Filter by status
    if (filters.companyStatus) {
      filteredResults = filteredResults.filter(company => 
        this.getStatusName(company.companyStatusCode) === filters.companyStatus
      );
    }
    
    // Filter by entity type
    if (filters.entityType) {
      filteredResults = filteredResults.filter(company => {
        if (filters.entityType === 'debtor') return company.isDebtor;
        if (filters.entityType === 'insured') return company.isInsuredCompany;
        if (filters.entityType === 'potential') return company.isPotentialCustomer;
        if (filters.entityType === 'agent') return company.isAgent;
        return false;
      });
    }
    
    // Filter by obligatory amount (min)
    if (filters.obligatoryMin) {
      const min = parseFloat(filters.obligatoryMin);
      filteredResults = filteredResults.filter(company => {
        const amount = parseFloat(company.obligatoryAmount.replace('$', '').replace(',', ''));
        return amount >= min;
      });
    }
    
    // Filter by obligatory amount (max)
    if (filters.obligatoryMax) {
      const max = parseFloat(filters.obligatoryMax);
      filteredResults = filteredResults.filter(company => {
        const amount = parseFloat(company.obligatoryAmount.replace('$', '').replace(',', ''));
        return amount <= max;
      });
    }
    
    this.companies = filteredResults;
  }

  viewCompanyDetails(company: Company): void {
    this.companyService.setSelectedCompany(company);
    this.router.navigate(['/company', company.id]);
  }

  // Utility methods to map codes to values
  getCountryName(code: number): string {
    const countryMap: Record<number, string> = {
      1: 'United States',
      2: 'United Kingdom',
      3: 'Germany',
      4: 'Canada',
      5: 'France'
    };
    return countryMap[code] || 'Unknown';
  }

  getBusinessFieldName(code: number): string {
    const fieldMap: Record<number, string> = {
      1: 'Technology',
      2: 'Manufacturing',
      3: 'Healthcare',
      4: 'Finance',
      5: 'Retail',
      6: 'Business Services'
    };
    return fieldMap[code] || 'Unknown';
  }

  getStatusName(code: number): string {
    const statusMap: Record<number, string> = {
      1: 'Active',
      2: 'Inactive',
      3: 'On Hold'
    };
    return statusMap[code] || 'Unknown';
  }

  getPrimaryIdType(company: Company): string {
    if (company.idTypeCode === 1) return 'Registration Number';
    if (company.idTypeCode === 2) return 'VAT Number';
    if (company.idTypeCode === 3) return 'DUNS Number';
    return 'Unknown';
  }

  getPrimaryId(company: Company): string {
    if (company.idTypeCode === 1) return company.registrationNumber || '';
    if (company.idTypeCode === 2) return company.vatNumber || '';
    if (company.idTypeCode === 3) return company.dunsNumber || '';
    return '';
  }
}