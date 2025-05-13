import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Company } from '../../../model/types';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  // Table configuration
  dataSource = new MatTableDataSource<Company>([]);
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
  
  // Filter state
  showFilters = true;
  showAdvancedFilters = false;
  filterForm: FormGroup;
  
  // Company data
  allCompanies: Company[] = [];
  countries: string[] = ['United States', 'United Kingdom', 'Germany', 'Canada', 'France'];
  businessFields: string[] = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Business Services'];
  statuses: string[] = ['Active', 'Inactive', 'On Hold'];
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
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
    // Initialize mock data
    this.allCompanies = this.getMockCompanies();
    this.dataSource.data = this.allCompanies;
    
    // Set up filter predicate for the table
    this.dataSource.filterPredicate = this.createFilterPredicate();
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
  
  applyFilters(): void {
    const formValues = this.filterForm.value;
    
    let filteredCompanies = this.allCompanies;
    
    // Filter by company name
    if (formValues.companyName) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.registrationName.toLowerCase().includes(formValues.companyName.toLowerCase())
      );
    }
    
    // Filter by primary ID
    if (formValues.primaryId) {
      filteredCompanies = filteredCompanies.filter(company => 
        (company.registrationNumber && company.registrationNumber.toLowerCase().includes(formValues.primaryId.toLowerCase())) ||
        (company.vatNumber && company.vatNumber.toLowerCase().includes(formValues.primaryId.toLowerCase())) ||
        (company.dunsNumber && company.dunsNumber.toLowerCase().includes(formValues.primaryId.toLowerCase()))
      );
    }
    
    // Filter by country
    if (formValues.country) {
      filteredCompanies = filteredCompanies.filter(company => 
        this.getCountryName(company.countryCode) === formValues.country
      );
    }
    
    // Filter by business field
    if (formValues.businessField) {
      filteredCompanies = filteredCompanies.filter(company => 
        this.getBusinessFieldName(company.businessFieldCode) === formValues.businessField
      );
    }
    
    // Filter by status
    if (formValues.companyStatus) {
      filteredCompanies = filteredCompanies.filter(company => 
        this.getStatusName(company.companyStatusCode) === formValues.companyStatus
      );
    }
    
    // Filter by entity type
    if (formValues.entityType) {
      filteredCompanies = filteredCompanies.filter(company => {
        if (formValues.entityType === 'debtor') {
          return company.isDebtor;
        } else if (formValues.entityType === 'insured') {
          return company.isInsuredCompany;
        } else if (formValues.entityType === 'potential') {
          return company.isPotentialCustomer;
        } else if (formValues.entityType === 'agent') {
          return company.isAgent;
        }
        return true;
      });
    }
    
    // Filter by obligatory amount
    if (formValues.obligatoryMin) {
      const min = parseFloat(formValues.obligatoryMin);
      filteredCompanies = filteredCompanies.filter(company => {
        const amount = this.getObligatoryAmountValue(company.obligatoryAmount);
        return amount >= min;
      });
    }
    
    if (formValues.obligatoryMax) {
      const max = parseFloat(formValues.obligatoryMax);
      filteredCompanies = filteredCompanies.filter(company => {
        const amount = this.getObligatoryAmountValue(company.obligatoryAmount);
        return amount <= max;
      });
    }
    
    this.dataSource.data = filteredCompanies;
  }
  
  clearFilters(): void {
    this.filterForm.reset();
    this.dataSource.data = this.allCompanies;
  }
  
  openCustomerManagement(company: Company): void {
    // This would be implemented to navigate to customer management view
    console.log('Opening customer management for:', company);
  }
  
  getPrimaryIdType(company: Company): string {
    switch (company.idTypeCode) {
      case 1: return 'Registration Number';
      case 2: return 'VAT Number';
      case 3: return 'DUNS Number';
      default: return 'Registration Number';
    }
  }
  
  getPrimaryId(company: Company): string {
    switch (company.idTypeCode) {
      case 1: return company.registrationNumber;
      case 2: return company.vatNumber || '';
      case 3: return company.dunsNumber || '';
      default: return company.registrationNumber;
    }
  }
  
  getStatusName(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'On Hold';
      default: return 'Unknown';
    }
  }
  
  getStatusClass(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'status-active';
      case 2: return 'status-inactive';
      case 3: return 'status-onhold';
      default: return '';
    }
  }
  
  getBusinessFieldName(fieldCode: number): string {
    switch (fieldCode) {
      case 1: return 'Technology';
      case 2: return 'Manufacturing';
      case 3: return 'Healthcare';
      case 4: return 'Finance';
      case 5: return 'Retail';
      case 6: return 'Business Services';
      default: return 'Unknown';
    }
  }
  
  getCountryName(countryCode: number): string {
    switch (countryCode) {
      case 1: return 'United States';
      case 2: return 'United Kingdom';
      case 3: return 'Germany';
      case 4: return 'Canada';
      case 5: return 'France';
      default: return 'Unknown';
    }
  }
  
  getEntityTypes(company: Company): string[] {
    const types: string[] = [];
    if (company.isDebtor) types.push('debtor');
    if (company.isInsuredCompany) types.push('insured');
    if (company.isPotentialCustomer) types.push('potential');
    if (company.isAgent) types.push('agent');
    return types;
  }
  
  getObligatoryAmountValue(obligatoryAmount: any): number {
    if (typeof obligatoryAmount === 'number') {
      return obligatoryAmount;
    } else if (typeof obligatoryAmount === 'string') {
      return parseFloat(obligatoryAmount.replace(/[^0-9.-]+/g, ''));
    }
    return 0;
  }
  
  getObligatoryAmountDisplay(obligatoryAmount: any): string {
    if (typeof obligatoryAmount === 'number') {
      return `$${obligatoryAmount.toLocaleString()}`;
    } else if (typeof obligatoryAmount === 'string') {
      return obligatoryAmount;
    }
    return '$0';
  }
  
  private createFilterPredicate(): (data: Company, filter: string) => boolean {
    return (data: Company, filter: string): boolean => {
      // Custom filter logic would go here
      return true;
    };
  }
  
  private getMockCompanies(): Company[] {
    return [
      { 
        id: 1,
        idTypeCode: 1,
        registrationNumber: 'REG-123456',
        dunsNumber: '',
        vatNumber: '',
        registrationName: 'Acme Global Solutions',
        tradeName: 'Acme Solutions',
        englishName: 'Acme Global Solutions',
        companyStatusCode: 1,
        businessFieldCode: 1,
        entityTypeCode: 1,
        foundingYear: 2010,
        countryCode: 1,
        website: 'www.acmeglobalsolutions.com',
        streetAddress: '123 Business Avenue',
        city: 'San Francisco',
        stateProvince: 'California',
        postalCode: '94105',
        phoneNumber: '+1 (555) 123-4567',
        mobileNumber: '+1 (555) 987-6543',
        faxNumber: '+1 (555) 123-4568',
        emailAddress: 'info@acmeglobalsolutions.com',
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
        englishName: 'TechCorp International',
        companyStatusCode: 1,
        businessFieldCode: 1,
        entityTypeCode: 2,
        foundingYear: 2012,
        countryCode: 2,
        website: 'www.techcorpinternational.com',
        streetAddress: '45 Tech Avenue',
        city: 'London',
        stateProvince: 'England',
        postalCode: 'EC1A 1BB',
        phoneNumber: '+44 20 1234 5678',
        mobileNumber: '+44 7700 900123',
        faxNumber: '+44 20 1234 5679',
        emailAddress: 'info@techcorpinternational.com',
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
        englishName: 'Global Manufacturing Ltd',
        companyStatusCode: 2,
        businessFieldCode: 2,
        entityTypeCode: 3,
        foundingYear: 2008,
        countryCode: 3,
        website: 'www.globalmanufacturing.de',
        streetAddress: '78 Industrial Strasse',
        city: 'Berlin',
        stateProvince: 'Berlin',
        postalCode: '10115',
        phoneNumber: '+49 30 1234567',
        mobileNumber: '+49 170 1234567',
        faxNumber: '+49 30 1234568',
        emailAddress: 'info@globalmanufacturing.de',
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
        tradeName: 'Sunrise Health',
        englishName: 'Sunrise Healthcare',
        companyStatusCode: 1,
        businessFieldCode: 3,
        entityTypeCode: 1,
        foundingYear: 2015,
        countryCode: 4,
        website: 'www.sunrisehealthcare.ca',
        streetAddress: '90 Health Boulevard',
        city: 'Toronto',
        stateProvince: 'Ontario',
        postalCode: 'M5V 2B7',
        phoneNumber: '+1 (416) 555-7890',
        mobileNumber: '+1 (416) 555-7891',
        faxNumber: '+1 (416) 555-7892',
        emailAddress: 'info@sunrisehealthcare.ca',
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
        englishName: 'Capital Finance Group',
        companyStatusCode: 3,
        businessFieldCode: 4,
        entityTypeCode: 2,
        foundingYear: 2005,
        countryCode: 1,
        website: 'www.capitalfinancegroup.com',
        streetAddress: '200 Finance Street',
        city: 'New York',
        stateProvince: 'New York',
        postalCode: '10007',
        phoneNumber: '+1 (212) 555-1234',
        mobileNumber: '+1 (212) 555-5678',
        faxNumber: '+1 (212) 555-9876',
        emailAddress: 'info@capitalfinancegroup.com',
        obligatoryAmount: '$500,000',
        isDebtor: true,
        isInsuredCompany: false,
        isPotentialCustomer: false,
        isAgent: false
      }
    ];
  }
}