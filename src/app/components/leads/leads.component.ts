import { Component, OnInit } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { DataService } from '../../services/data.service';

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

  leadStatuses = [
    { id: 'all', label: 'All Leads', count: 0 },
    { id: 'new', label: 'New', count: 0 },
    { id: 'contacted', label: 'Contacted', count: 0 },
    { id: 'qualified', label: 'Qualified', count: 0 },
    { id: 'proposal', label: 'Proposal', count: 0 },
    { id: 'negotiation', label: 'Negotiation', count: 0 }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.leads = this.dataService.getLeads();
    this.companies = this.dataService.getCompanies();
    this.updateStatusCounts();
    this.filterLeads();
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
    // Find if this lead already exists
    const existingIndex = this.leads.findIndex(l => 
      l === this.selectedLead || // Same instance comparison
      (l.title === lead.title && l.company === lead.company) // Same key properties
    );
    
    if (existingIndex >= 0) {
      // Update existing lead
      this.leads[existingIndex] = lead;
    } else {
      // Add new lead
      this.leads.push(lead);
    }
    
    // In a real app, would call the data service to persist changes
    // this.dataService.saveLead(lead);
    
    // Refresh the view
    this.updateStatusCounts();
    this.filterLeads();
  }
}