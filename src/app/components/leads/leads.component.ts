import { Component, Input, OnInit } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { LeadService } from '../../services/lead.service';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {
  @Input() company: any; // Accept the company object as input

  leads: Lead[] = [];
  companies: Company[] = [];
  filteredLeads: Lead[] = [];
  activeStatus: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'value';

  // Lead detail
  selectedLead: Lead | null = null;
  isLeadDetailOpen: boolean = false;

  // Loading and error states
  loading: boolean = false;
  error: string | null = null;
  // Query parameters for pre-filled data
  preSelectedCompanyId: number | null = null;
  preSelectedCompanyName: string | null = null;
  leadStatuses = [
    { id: 'all', label: 'All Leads', count: 0 },
    { id: 'new', label: 'New', count: 0 },
    { id: 'contacted', label: 'Contacted', count: 0 },
    { id: 'qualified', label: 'Qualified', count: 0 },
    { id: 'proposal', label: 'Proposal', count: 0 },
    { id: 'negotiation', label: 'Negotiation', count: 0 }
  ];

  constructor(
    private leadService: LeadService, 
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      this.preSelectedCompanyId = params['companyId'] ? parseInt(params['companyId'], 10) : null;
      this.preSelectedCompanyName = params['companyName'] || null;
      
      // If action is 'new', automatically open the lead creation dialog
      if (params['action'] === 'new' && this.preSelectedCompanyId) {
        // Set up a pre-filled lead and open the dialog
        setTimeout(() => {
          this.createNewLead();
        }, 100);
      }
    });

    if (this.company) {
      this.loadLeads();
    } else {
      this.loadCompanies();
      this.loadLeads();
    }
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
      this.leadService.getLeadsByCompanyId(this.company.id)
        .subscribe({
          next: (leads) => {
            this.leads = leads;
            this.filteredLeads = leads; // Ensure leads are displayed
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
    this.leadStatuses[0].count = this.leads.length;
    
    // Reset counts
    for (let i = 1; i < this.leadStatuses.length; i++) {
      this.leadStatuses[i].count = 0;
    }
    
    // Count leads for each status
    this.leads.forEach(lead => {
      const status = lead.leadStatusName?.toLowerCase();
      const statusObj = this.leadStatuses.find(s => s.id === status);
      if (statusObj) {
        statusObj.count++;
      }
    });
  }

  filterLeads(): void {
    // First filter by status
    let results = this.leads;
    if (this.activeStatus !== 'all') {
      results = results.filter(lead => 
        lead.leadStatusName?.toLowerCase() === this.activeStatus
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
        this.filteredLeads.sort((a, b) => b.salesGapValue ?? 0 - (a.salesGapValue ?? 0));
        break;
      case 'probability':
        this.filteredLeads.sort((a, b) => b.probability - a.probability);
        break;
   
    }
  }

  // Lead detail methods
  openLeadDetail(lead: Lead): void {
    this.selectedLead = lead;
    this.isLeadDetailOpen = true;
  }
  
  createNewLead(): void {
    this.selectedLead = null; // Null indicates a new lead
    this.isLeadDetailOpen = true;
  }
  
  closeLeadDetail(): void {
    this.isLeadDetailOpen = false;
    this.selectedLead = null;
  }
  
  saveLead(lead: Lead): void {
    this.loading = true;
    this.error = null;
    
    if (this.selectedLead) {
      // Update existing lead
      this.leadService.updateLead(this.selectedLead.leadId || 0, lead)
        .subscribe({
          next: () => {
            this.loadLeads()
            this.closeLeadDetail();
            this.loading = false;
            
            this.snackBar.open('Lead updated successfully', 'Close', {
              duration: 3000
            });
          },
          error: (err) => {
            this.error = 'Failed to update lead. Please try again.';
            this.loading = false;
            console.error('Error updating lead:', err);
          }
        });
    } else {
      // Create new lead
      this.leadService.createLead(lead)
        .subscribe({
          next: () => {
            this.loadLeads();
            this.closeLeadDetail();
            this.loading = false;
            
            this.snackBar.open('Lead created successfully', 'Close', {
              duration: 3000
            });
          },
          error: (err) => {
            this.error = 'Failed to create lead. Please try again.';
            this.loading = false;
            console.error('Error creating lead:', err);
          }
        });
    }
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