import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { LeadService } from '../../services/lead.service';
import { CompanyService } from '../../services/company.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit, OnChanges {
  @Input() companyFilter: number | null = null; // Used when embedded in company detail
  @Input() embedded: boolean = false; // Flag to indicate if component is embedded in another view
  @Input() showAddButton: boolean = true; // Whether to show the add lead button
  
  leads: Lead[] = [];
  companies: Company[] = [];
  filteredLeads: Lead[] = [];
  pagedLeads: Lead[] = []; // For pagination
  activeStatus: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'value';

  // Lead detail
  selectedLead: Lead | null = null;
  isLeadDetailOpen: boolean = false;

  // Loading and error states
  loading: boolean = false;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Math for template
  Math = Math;

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
  
  ngOnChanges(changes: SimpleChanges): void {
    // Reload leads when companyFilter changes
    if (changes['companyFilter'] && !changes['companyFilter'].firstChange) {
      this.loadLeads();
    }
  }

  loadCompanies(): void {
    this.loading = true;
    this.companyService.getCompanies()
      .subscribe({
        next: (companies: Company[]) => {
          this.companies = companies;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to load companies. Please try again later.';
          this.loading = false;
          console.error('Error loading companies:', err);
        }
      });
  }

  loadLeads(): void {
    this.loading = true;
    this.error = null;
    
    // Use the company-specific endpoint if a company filter is provided
    const loadLeadsObservable = this.companyFilter 
      ? this.leadService.getLeadsByCompany(this.companyFilter)
      : this.leadService.getLeads();
    
    loadLeadsObservable.subscribe({
      next: (leads: Lead[]) => {
        this.leads = leads;
        this.updateStatusCounts();
        this.filterLeads();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
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
    this.updatePagination();
    this.sortLeads();
  }
  
  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredLeads.length / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    // Get leads for current page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedLeads = this.filteredLeads.slice(startIndex, startIndex + this.pageSize);
  }
  
  // Pagination controls
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  // Get an array of page numbers for pagination UI
  get pageNumbers(): number[] {
    const pageArray: number[] = [];
    
    // Show 5 page numbers centered around current page when possible
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageArray.push(i);
    }
    
    return pageArray;
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
    
    // Update the paged leads after sorting
    this.updatePagination();
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
    // If embedded in company detail, pre-fill the company
    const newLead: Lead = {
      id: 0,
      title: '',
      companyId: this.companyFilter || undefined,
      company: this.companyFilter ? 
        this.companies.find(c => c.id === this.companyFilter)?.name || '' : '',
      status: 'New',
      value: 0,
      probability: 0,
      owner: '',
      lastUpdate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    this.selectedLead = newLead;
    this.isLeadDetailOpen = true;
  }
  
  closeLeadDetail(): void {
    this.isLeadDetailOpen = false;
    this.selectedLead = null;
  }
  
  saveLead(lead: Lead): void {
    this.loading = true;
    this.error = null;
    
    if (this.selectedLead && this.selectedLead.id) {
      // Update existing lead
      this.leadService.updateLead(this.selectedLead.id, lead)
        .subscribe({
          next: () => {
            this.loadLeads();
            this.closeLeadDetail();
            this.loading = false;
          },
          error: (err: HttpErrorResponse) => {
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
          error: (err: HttpErrorResponse) => {
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