import { Component, Input, OnInit } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { LeadService } from '../../services/lead.service';
import { CompanyService } from '../../services/company.service';
import { GeneralCodeService, GeneralCode } from '../../services/general-codes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SharedModule } from '../../core/modules/shared.module';
import { MaterialModule } from '../../core/modules/material.module';
import { LeadsListComponent } from '../leads-list/leads-list.component';

@Component({
    selector: 'app-leads',
    templateUrl: './leads.component.html',
    styleUrls: ['./leads.component.css'],
    standalone: true,
    imports: [MaterialModule,SharedModule,LeadsListComponent]

})
export class LeadsComponent implements OnInit {
  @Input() company: any; // Accept the company object as input

  leads: Lead[] = [];
  companies: Company[] = [];
  filteredLeads: Lead[] = [];
  activeStatus: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'value';

  // Loading and error states
  loading: boolean = false;
  error: string | null = null;

  // Query parameters for pre-filled data
  preSelectedCompanyId: number | null = null;
  preSelectedCompanyName: string | null = null;

  // Lead statuses loaded from general codes
  leadStatuses: { id: string; label: string; count: number; codeNumber?: number }[] = [];
  leadStatusCodes: GeneralCode[] = [];

  constructor(
    private leadService: LeadService, 
    private companyService: CompanyService,
    private generalCodeService: GeneralCodeService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check for query parameters (but don't auto-create lead)
    this.route.queryParams.subscribe(params => {
      this.preSelectedCompanyId = params['companyId'] ? parseInt(params['companyId'], 10) : null;
      this.preSelectedCompanyName = params['companyName'] || null;
    });

    // Load lead statuses first, then load other data
    this.loadLeadStatuses().then(() => {
      if (this.company) {
        this.loadLeads();
      } else {
        this.loadCompanies();
        this.loadLeads();
      }
    });
  }

  loadLeadStatuses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.generalCodeService.getCodesByType(70).subscribe({
        next: (statusCodes) => {
          this.leadStatusCodes = statusCodes;
          
          // Create the leadStatuses array with "All" option first
          this.leadStatuses = [
            { id: 'all', label: 'All Leads', count: 0 }
          ];
          
          // Add status codes to the array
          statusCodes.forEach(status => {
            this.leadStatuses.push({
              id: status.codeNumber.toString(),
              label: status.codeShortDescription,
              count: 0,
              codeNumber: status.codeNumber
            });
          });
          
          resolve();
        },
        error: (err) => {
          console.error('Error loading lead statuses:', err);
          // Fallback to hardcoded statuses if loading fails
          this.leadStatuses = [
            { id: 'all', label: 'All Leads', count: 0 },
            { id: '1', label: 'New', count: 0, codeNumber: 1 },
            { id: '2', label: 'Contacted', count: 0, codeNumber: 2 },
            { id: '3', label: 'Qualified', count: 0, codeNumber: 3 },
            { id: '4', label: 'Proposal', count: 0, codeNumber: 4 },
            { id: '5', label: 'Negotiation', count: 0, codeNumber: 5 }
          ];
          resolve();
        }
      });
    });
  }

  loadCompanies() {
    this.loading = true;
    this.companyService.getCompanies()
      .subscribe({
        next: (companies) => {
          this.companies = companies;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load companies. Please try again later.';
          this.loading = false;
          console.error('Error loading companies:', err);
        }
      });
  }

  loadLeads() {
    if (this.company) {
      this.loading = true;
      this.leadService.getLeadsByCompany(this.company.id)
        .subscribe({
          next: (leads) => {
            this.leads = leads;
            this.filteredLeads = leads;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load leads for the company. Please try again later.';
            this.loading = false;
            console.error('Error loading company leads:', err);
          }
        });
    } else {
      this.loading = true;
      this.error = null;
      
      this.leadService.getLeads()
        .subscribe({
          next: (leads) => {
            this.leads = leads;
            this.updateStatusCounts();
            this.filterLeads();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load leads. Please try again later.';
            this.loading = false;
            console.error('Error loading leads:', err);
          }
        });
    }
  }

  updateStatusCounts(): void {
    // Reset all counts to 0
    this.leadStatuses.forEach(status => status.count = 0);
    
    // Set total count for "All Leads"
    this.leadStatuses[0].count = this.leads.length;
    
    // Count leads for each status
    this.leads.forEach(lead => {
      // Find the matching status by codeNumber
      const statusObj = this.leadStatuses.find(s => 
        s.codeNumber && s.codeNumber === lead.statusCode
      );
      if (statusObj) {
        statusObj.count++;
      }
    });
  }

  filterLeads(): void {
    // First filter by status
    let results = this.leads;
    if (this.activeStatus !== 'all') {
      // Convert activeStatus to number and filter by statusCode
      const statusCodeNumber = parseInt(this.activeStatus, 10);
      results = results.filter(lead => 
        lead.statusCode === statusCodeNumber
      );
    }
    
    // Then filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      results = results.filter(lead => 
        lead.leadName.toLowerCase().includes(search) || 
        lead.companyName?.toLowerCase().includes(search) ||
        lead.ownerName?.toLowerCase().includes(search)
      );
    }
    
    this.filteredLeads = results;
    this.sortLeads();
  }

  sortLeads(): void {
    switch (this.sortBy) {
      case 'value':
        this.filteredLeads.sort((a, b) => (b.salesGapValue ?? 0) - (a.salesGapValue ?? 0));
        break;
      case 'probability':
        this.filteredLeads.sort((a, b) => b.probability - a.probability);
        break;
      // Add more sorting options as needed
    }
  }

  // Navigate to lead detail for editing
  openLeadDetail(lead: Lead): void {
    if (lead.leadId) {
      this.router.navigate(['/leads', lead.leadId]);
    } else {
      console.error('Cannot open lead detail without lead ID');
    }
  }
  
  // Navigate to new lead creation
  createNewLead(): void {
    // Navigate to new lead creation page
    const queryParams: any = {};
    
    // If we have pre-selected company info, pass it along
    if (this.preSelectedCompanyId) {
      queryParams.companyId = this.preSelectedCompanyId;
      queryParams.companyName = this.preSelectedCompanyName;
    }
    
    this.router.navigate(['/leads/new'], {
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined
    });
  }
  
  // Get company name for a lead when displaying details
  getCompanyName(companyId: number): string {
    const company = this.companies.find(c => c.id === companyId);
    return company ? company.registrationName : 'Unknown Company';
  }
  
  // For lead creation, provide list of companies
  getCompanyOptions(): Company[] {
    return this.companies;
  }
}