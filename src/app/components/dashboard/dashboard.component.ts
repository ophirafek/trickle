import { Component, OnInit } from '@angular/core';
import { Company, Meeting, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MeetingService } from '../../services/meeting.service';
import { LeadService } from '../../services/lead.service';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  companies: Company[] = [];
  meetings: Meeting[] = [];
  leads: Lead[] = [];
  
  // Loading and error states
  loading: boolean = false;
  error: string | null = null;

  quickActions = [
    { icon: 'add_business', label: 'New Company', color: 'blue' },
    { icon: 'track_changes', label: 'Create Lead', color: 'green' },
    { icon: 'event', label: 'Schedule Meeting', color: 'purple' },
    { icon: 'note_add', label: 'Add Note', color: 'orange' }
  ];

  constructor(
    private companyService: CompanyService,
    private meetingService: MeetingService,
    private leadService: LeadService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load companies
    this.companyService.getCompanies()
      .subscribe({
        next: (companies) => {
          this.companies = companies.slice(0, 3); // Show only 3 most recent companies
          this.loadMeetings();
        },
        error: (err) => {
          this.error = 'Failed to load companies. Please try again later.';
          this.loading = false;
          console.error('Error loading companies:', err);
        }
      });
  }

  loadMeetings(): void {
    this.meetingService.getMeetings()
      .subscribe({
        next: (meetings) => {
          // Sort by date and time to get upcoming meetings
          this.meetings = meetings
            .sort((a, b) => {
              // First compare dates
              const dateComparison = a.date.localeCompare(b.date);
              // If dates are the same, compare times
              return dateComparison === 0 ? a.time.localeCompare(b.time) : dateComparison;
            })
            .slice(0, 3); // Show only 3 upcoming meetings
          
          this.loadLeads();
        },
        error: (err) => {
          this.error = 'Failed to load meetings. Please try again later.';
          this.loading = false;
          console.error('Error loading meetings:', err);
        }
      });
  }

  loadLeads(): void {
    this.leadService.getLeads()
      .subscribe({
        next: (leads) => {
          // Sort leads by value (highest first)
          this.leads = leads
            .sort((a, b) => b.value - a.value)
            .slice(0, 3); // Show only top 3 leads
          
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load leads. Please try again later.';
          this.loading = false;
          console.error('Error loading leads:', err);
        }
      });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

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
}