import { Component, OnInit } from '@angular/core';
import { Meeting } from '../../../model/types';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  groupedMeetings: { [key: string]: Meeting[] } = {};
  viewType: 'list' | 'calendar' = 'list';
  selectedType: string = 'All Types';
  searchTerm: string = '';
  
  // Meeting detail
  selectedMeeting: Meeting | null = null;
  isMeetingDetailOpen: boolean = false;
  
  meetingTypes: string[] = ['All Types', 'Demo', 'Sales', 'Internal', 'Legal', 'Planning'];
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.meetings = this.dataService.getMeetings();
    this.filterMeetings();
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
    this.selectedMeeting = meeting;
    this.isMeetingDetailOpen = true;
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
    // Find if this meeting already exists
    const existingIndex = this.meetings.findIndex(m => m.id === meeting.id);
    
    if (existingIndex >= 0) {
      // Update existing meeting
      this.meetings[existingIndex] = meeting;
    } else {
      // Add new meeting
      this.meetings.push(meeting);
    }
    
    // In a real app, would call the data service to persist changes
    // this.dataService.saveMeeting(meeting);
    
    // Refresh the view
    this.filterMeetings();
  }
}