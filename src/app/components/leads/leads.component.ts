import { Component, OnInit } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { LeadService } from '../../services/lead.service';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit {
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
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadLeads();
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

  updateStatusCounts(): void {
    this.leadStatuses[0].count = this.leads.length;
    
    // Reset counts
    for (let i = 1; i < this.leadStatuses.length; i++) {
      this.leadStatuses[i].count = 0;
    }
    
    // Count leads for each status
    this.leads.forEach(lead => {
      const status = lead.status.toLowerCase();
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
        lead.status.toLowerCase() === this.activeStatus
      );
    }
    
    // Then filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      results = results.filter(lead => 
        lead.title.toLowerCase().includes(search) || 
        lead.company.toLowerCase().includes(search) ||
        lead.owner.toLowerCase().includes(search)
      );
    }
    
    this.filteredLeads = results;
    this.sortLeads();
  }

  sortLeads(): void {
    switch (this.sortBy) {
      case 'value':
        this.filteredLeads.sort((a, b) => b.value - a.value);
        break;
      case 'probability':
        this.filteredLeads.sort((a, b) => b.probability - a.probability);
        break;
      case 'lastUpdate':
        // Simple sort for demo purposes - in a real app would parse the date
        this.filteredLeads.sort((a, b) => a.lastUpdate.localeCompare(b.lastUpdate));
        break;
    }
  }

  getStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'New': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-yellow-100 text-yellow-700',
      'Qualified': 'bg-purple-100 text-purple-700',
      'Proposal': 'bg-green-100 text-green-700',
      'Negotiation': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
      this.leadService.updateLead(this.selectedLead.id || 0, lead)
        .subscribe({
          next: () => {
            this.loadLeads();
            this.closeLeadDetail();
            this.loading = false;
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
    return company ? company.name : 'Unknown Company';
  }
  
  // For lead creation, provide list of companies
  getCompanyOptions(): Company[] {
    return this.companies;
  }
}