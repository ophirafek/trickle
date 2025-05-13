// leads.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lead } from '../../../../model/types';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-company-leads',
  templateUrl: './company-leads.component.html',
  styleUrls: ['./company-leads.component.scss', '../company-details-tab-style.scss']
})
export class CompanyLeadsComponent implements OnInit {
  @Input() companyId?: number;
  leads: Lead[] = [];
  displayedColumns: string[] = [
    'leadNumber', 
    'leadName', 
    'leadType',
    'status',
    'salesGapValue',
    'probability',
    'market',
    'contactPerson',
    'owner',
    'actions'
  ];

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.companyService.getLeads().subscribe(leads => {
      this.leads = leads;
    });
  }

  createLead(): void {
    // Navigate to lead creation page
    this.router.navigate(['/leads/create'], { 
      queryParams: { companyId: this.companyId } 
    });
  }

  editLead(lead: Lead): void {
    // Navigate to lead edit page
    this.router.navigate(['/leads/edit', lead.id], { 
      queryParams: { companyId: this.companyId } 
    });
  }

  deleteLead(leadId: number): void {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.companyService.deleteLead(leadId);
    }
  }
}