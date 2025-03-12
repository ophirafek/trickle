import { Component, OnInit } from '@angular/core';
import { Meeting, Company } from '../../../model/types';
import { MeetingService } from '../../services/meeting.service';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  companies: Company[] = [];
  filteredMeetings: Meeting[] = [];
  groupedMeetings: { [key: string]: Meeting[] } = {};
  viewType: 'list' | 'calendar' = 'list';
  selectedType: string = 'All Types';
  searchTerm: string = '';
  
  // Meeting detail
  selectedMeeting: Meeting | null = null;
  isMeetingDetailOpen: boolean = false;
  
  // Loading and error states
  loading: boolean = false;
  error: string | null = null;
  
  meetingTypes: string[] = ['All Types', 'Demo', 'Sales', 'Internal', 'Legal', 'Planning'];
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private meetingService: MeetingService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadMeetings();
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

  loadMeetings() {
    this.loading = true;
    this.error = null;
    
    this.meetingService.getMeetings()
      .subscribe({
        next: (meetings) => {
          this.meetings = meetings;
          this.filterMeetings();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load meetings. Please try again later.';
          this.loading = false;
          console.error('Error loading meetings:', err);
        }
      });
  }

  filterMeetings(): void {
    // Filter by type
    let results = this.meetings;
    if (this.selectedType !== 'All Types') {
      results = results.filter(meeting => meeting.type === this.selectedType);
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      results = results.filter(meeting => 
        meeting.title.toLowerCase().includes(search) || 
        meeting.company.toLowerCase().includes(search) ||
        meeting.attendees.some(a => a.name.toLowerCase().includes(search))
      );
    }
    
    this.filteredMeetings = results;
    this.groupMeetingsByDate();
  }

  groupMeetingsByDate(): void {
    this.groupedMeetings = {};
    
    for (const meeting of this.filteredMeetings) {
      if (!this.groupedMeetings[meeting.date]) {
        this.groupedMeetings[meeting.date] = [];
      }
      this.groupedMeetings[meeting.date].push(meeting);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric' 
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  // Calendar view helper methods
  getDateForDay(day: string): number {
    // Simplified - would use actual date calculations in real app
    const dayMap: { [key: string]: number } = {
      'Monday': 24,
      'Tuesday': 25,
      'Wednesday': 26,
      'Thursday': 27,
      'Friday': 28,
      'Saturday': 29,
      'Sunday': 30
    };
    return dayMap[day] || 1;
  }

  getMeetingsForDay(day: string): Meeting[] {
    // Simplified - would use actual date calculations in real app
    const dateStr = '2025-02-' + (this.getDateForDay(day).toString().padStart(2, '0'));
    return this.filteredMeetings.filter(m => m.date === dateStr);
  }

  // Meeting detail methods
  openMeetingDetail(meeting: Meeting): void {
    this.loading = true;
    
    this.meetingService.getMeeting(meeting.id)
      .subscribe({
        next: (meetingData) => {
          this.selectedMeeting = meetingData;
          this.isMeetingDetailOpen = true;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load meeting details. Please try again later.';
          this.loading = false;
          console.error('Error loading meeting details:', err);
        }
      });
  }
  
  createNewMeeting(): void {
    this.selectedMeeting = null; // Null indicates a new meeting
    this.isMeetingDetailOpen = true;
  }
  
  closeMeetingDetail(): void {
    this.isMeetingDetailOpen = false;
    this.selectedMeeting = null;
  }
  
  saveMeeting(meeting: Meeting): void {
    this.loading = true;
    this.error = null;
    
    if (this.selectedMeeting) {
      // Update existing meeting
      this.meetingService.updateMeeting(this.selectedMeeting.id, meeting)
        .subscribe({
          next: () => {
            this.loadMeetings();
            this.closeMeetingDetail();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to update meeting. Please try again.';
            this.loading = false;
            console.error('Error updating meeting:', err);
          }
        });
    } else {
      // Create new meeting
      this.meetingService.createMeeting(meeting)
        .subscribe({
          next: () => {
            this.loadMeetings();
            this.closeMeetingDetail();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to create meeting. Please try again.';
            this.loading = false;
            console.error('Error creating meeting:', err);
          }
        });
    }
  }
  
  // Get company name for meeting when displaying details
  getCompanyName(companyId: number): string {
    const company = this.companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  }
  
  // For meeting creation, provide list of companies
  getCompanyOptions(): Company[] {
    return this.companies;
  }
}