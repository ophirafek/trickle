import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Lead } from '../../../model/types';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.css']
})
export class LeadsListComponent {
  @Input() leads: Lead[] = [];
  @Input() loading: boolean = false;
  @Input() showCompanyColumn: boolean = true; // Whether to show the company column (hide when in company context)
  @Output() leadSelected = new EventEmitter<Lead>();
  
  /**
   * Get the appropriate theme color for a lead status
   */
  getLeadStatusColor(status: string): ThemePalette {
    const colorMap: { [key: string]: ThemePalette } = {
      'New': 'primary',
      'Contacted': 'accent',
      'Qualified': 'primary',
      'Proposal': 'accent',
      'Negotiation': 'warn'
    };
    return colorMap[status] || 'primary';
  }
  
  /**
   * Handle lead selection
   */
  openLeadDetail(lead: Lead): void {
    this.leadSelected.emit(lead);
  }
}