// company-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company } from   '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
  selectedCompany: Company | null = null;
  activeTab = 'general';
  expandedSection = 'companyInfo';
  private subscription: Subscription | null = null;
  
  // Entity type flags
  entityTypes = {
    debtor: false,
    insured: false,
    agent: false,
    potential: false
  };
  entityTypeError = '';

  constructor(
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Get company ID from route params and load company
    this.subscription = this.companyService.getSelectedCompany().subscribe(company => {
      if (company) {
        this.selectedCompany = company;
        this.setEntityTypesFromCompany(company);
      } else {
        // If no company is selected, redirect to company list
        this.router.navigate(['/companies']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setEntityTypesFromCompany(company: Company): void {
    this.entityTypes = {
      debtor: company.isDebtor || false,
      insured: company.isInsuredCompany || false,
      agent: company.isAgent || false,
      potential: company.isPotentialCustomer || false
    };
  }

  // Toggle sections in Customer Management
  toggleSection(section: string): void {
    if (this.expandedSection === section) {
      this.expandedSection = '';
    } else {
      this.expandedSection = section;
    }
  }

  // Change the active tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Handle entity type changes
  handleEntityTypeChange(type: string): void {
    const newEntityTypes = { ...this.entityTypes };
    newEntityTypes[type as keyof typeof newEntityTypes] = !newEntityTypes[type as keyof typeof newEntityTypes];
    
    // Business rule: Cannot be both insured and potential at the same time
    if (type === 'insured' && newEntityTypes.insured && newEntityTypes.potential) {
      newEntityTypes.potential = false;
      this.entityTypeError = 'A company cannot be both "Insured" and "Potential" at the same time. "Potential" has been deselected.';
    } else if (type === 'potential' && newEntityTypes.potential && newEntityTypes.insured) {
      newEntityTypes.insured = false;
      this.entityTypeError = 'A company cannot be both "Potential" and "Insured" at the same time. "Insured" has been deselected.';
    } else {
      this.entityTypeError = '';
    }
    
    this.entityTypes = newEntityTypes;
    
    // Update the company object
    if (this.selectedCompany) {
      this.selectedCompany.isDebtor = newEntityTypes.debtor;
      this.selectedCompany.isInsuredCompany = newEntityTypes.insured;
      this.selectedCompany.isAgent = newEntityTypes.agent;
      this.selectedCompany.isPotentialCustomer = newEntityTypes.potential;
    }
  }

  saveCompany(): void {
    // In a real application, this would save the company to the backend
    this.snackBar.open('Company saved successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  // Navigate back to company list
  backToList(): void {
    this.router.navigate(['/companies']);
  }

  // Method to get country name from code
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
}