import { Component, OnInit } from '@angular/core';

interface Company {
  id: number;
  name: string;
  primaryIdType: string;
  primaryId: string;
  country: string;
  businessField: string;
  status: string;
  obligatoryAmount: string;
  entityType: string[];
}

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  // Filter visibility toggles
  showFilters = true;
  showAdvancedFilters = false;

  // Filter states
  filters = {
    companyName: '',
    primaryId: '',
    country: '',
    businessField: '',
    companyStatus: '',
    entityType: '',
    obligatoryMin: '',
    obligatoryMax: ''
  };

  // Mock company data
  allCompanies: Company[] = [
    { 
      id: 1,
      name: 'Acme Global Solutions', 
      primaryIdType: 'Registration Number',
      primaryId: 'REG-123456',
      country: 'United States',
      businessField: 'Technology',
      status: 'Active',
      obligatoryAmount: '$250,000',
      entityType: ['debtor', 'insured']
    },
    { 
      id: 2,
      name: 'TechCorp International', 
      primaryIdType: 'VAT Number',
      primaryId: 'GB987654321',
      country: 'United Kingdom',
      businessField: 'Technology',
      status: 'Active',
      obligatoryAmount: '$175,000',
      entityType: ['insured']
    },
    { 
      id: 3,
      name: 'Global Manufacturing Ltd', 
      primaryIdType: 'DUNS Number',
      primaryId: '456789123',
      country: 'Germany',
      businessField: 'Manufacturing',
      status: 'Inactive',
      obligatoryAmount: '$100,000',
      entityType: ['potential']
    },
    { 
      id: 4,
      name: 'Sunrise Healthcare', 
      primaryIdType: 'Registration Number',
      primaryId: 'REG-789123',
      country: 'Canada',
      businessField: 'Healthcare',
      status: 'Active',
      obligatoryAmount: '$320,000',
      entityType: ['debtor', 'potential']
    },
    { 
      id: 5,
      name: 'Capital Finance Group', 
      primaryIdType: 'DUNS Number',
      primaryId: '987321654',
      country: 'United States',
      businessField: 'Finance',
      status: 'On Hold',
      obligatoryAmount: '$500,000',
      entityType: ['debtor']
    }
  ];
  
  // Filtered companies
  companies: Company[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // Initialize companies with all companies
    this.companies = [...this.allCompanies];
  }

  // Toggle filters visibility
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Toggle advanced filters visibility
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Handle filter input changes
  handleFilterChange(event: any): void {
    const { name, value } = event.target;
    this.filters = {
      ...this.filters,
      [name]: value
    };
  }

  // Clear all filters
  clearFilters(): void {
    this.filters = {
      companyName: '',
      primaryId: '',
      country: '',
      businessField: '',
      companyStatus: '',
      entityType: '',
      obligatoryMin: '',
      obligatoryMax: ''
    };
    this.companies = [...this.allCompanies];
  }

  // Apply filters
  applyFilters(): void {
    let filteredResults = [...this.allCompanies];
    
    // Filter by company name
    if (this.filters.companyName) {
      filteredResults = filteredResults.filter(company => 
        company.name.toLowerCase().includes(this.filters.companyName.toLowerCase())
      );
    }
    
    // Filter by primary ID
    if (this.filters.primaryId) {
      filteredResults = filteredResults.filter(company => 
        company.primaryId.toLowerCase().includes(this.filters.primaryId.toLowerCase())
      );
    }
    
    // Filter by country
    if (this.filters.country) {
      filteredResults = filteredResults.filter(company => 
        company.country === this.filters.country
      );
    }
    
    // Filter by business field
    if (this.filters.businessField) {
      filteredResults = filteredResults.filter(company => 
        company.businessField === this.filters.businessField
      );
    }
    
    // Filter by status
    if (this.filters.companyStatus) {
      filteredResults = filteredResults.filter(company => 
        company.status === this.filters.companyStatus
      );
    }
    
    // Filter by entity type
    if (this.filters.entityType) {
      filteredResults = filteredResults.filter(company => 
        company.entityType && company.entityType.includes(this.filters.entityType)
      );
    }
    
    // Filter by obligatory amount (min)
    if (this.filters.obligatoryMin) {
      const min = parseFloat(this.filters.obligatoryMin);
      filteredResults = filteredResults.filter(company => {
        const amount = parseFloat(company.obligatoryAmount.replace('$', '').replace(',', ''));
        return amount >= min;
      });
    }
    
    // Filter by obligatory amount (max)
    if (this.filters.obligatoryMax) {
      const max = parseFloat(this.filters.obligatoryMax);
      filteredResults = filteredResults.filter(company => {
        const amount = parseFloat(company.obligatoryAmount.replace('$', '').replace(',', ''));
        return amount <= max;
      });
    }
    
    this.companies = filteredResults;
  }
  
  // View company details (placeholder for navigation)
  viewCompanyDetails(company: Company): void {
    console.log('View company', company);
    // Here you would typically navigate to the company details page
    // this.router.navigate(['/companies', company.id]);
  }
}