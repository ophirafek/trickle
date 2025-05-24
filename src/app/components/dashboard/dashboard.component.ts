// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Company, Meeting, Lead } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MeetingService } from '../../services/meeting.service';
import { LeadService } from '../../services/lead.service';
import { ThemePalette } from '@angular/material/core';
import { TranslocoService } from '@ngneat/transloco';

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
    { icon: 'add_business', label: 'DASHBOARD.NEW_COMPANY', color: 'blue' },
    { icon: 'track_changes', label: 'DASHBOARD.CREATE_LEAD', color: 'green' },
    { icon: 'event', label: 'DASHBOARD.SCHEDULE_MEETING', color: 'purple' },
    { icon: 'note_add', label: 'DASHBOARD.ADD_NOTE', color: 'orange' }
  ];

  constructor(
    private companyService: CompanyService,
    private meetingService: MeetingService,
    private leadService: LeadService,
    private translocoService: TranslocoService
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
          this.error = this.translocoService.translate('COMMON.ERROR') + 
                      ': ' + this.translocoService.translate('DASHBOARD.LOAD_ERROR');
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
          this.error = this.translocoService.translate('COMMON.ERROR') + 
                      ': ' + this.translocoService.translate('DASHBOARD.MEETINGS_LOAD_ERROR');
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
            .sort((a, b) => b.salesGapValue ?? 0 - (a.salesGapValue ?? 0))
            .slice(0, 3); // Show only top 3 leads
          
          this.loading = false;
        },
        error: (err) => {
          this.error = this.translocoService.translate('COMMON.ERROR') + 
                      ': ' + this.translocoService.translate('DASHBOARD.LEADS_LOAD_ERROR');
          this.loading = false;
          console.error('Error loading leads:', err);
        }
      });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  getLeadStatusColor(status: number): ThemePalette {
    const colorMap: { [key: number]: ThemePalette } = {
      1: 'primary',
      2: 'accent',
      3: 'primary',
      4: 'accent',
      5: 'warn'
    };
    return colorMap[status] || 'primary';
  }
}