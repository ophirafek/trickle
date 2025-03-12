import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Meeting, Attendee, Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-meeting-detail',
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.css']
})
export class MeetingDetailComponent implements OnInit {
  @Input() meeting: Meeting | null = null;
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Meeting>();

  editingMeeting: Meeting = this.getEmptyMeeting();
  isNewMeeting: boolean = true;
  companies: Company[] = [];
  
  loading: boolean = false;
  error: string | null = null;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.resetForm();
    this.loadCompanies();
  }

  ngOnChanges(): void {
    this.resetForm();
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

  resetForm(): void {
    if (this.meeting) {
      // Create a deep copy to avoid modifying the original object
      this.editingMeeting = {
        ...this.meeting,
        attendees: [...this.meeting.attendees.map(a => ({...a}))]
      };
      this.isNewMeeting = false;
    } else {
      this.editingMeeting = this.getEmptyMeeting();
      this.isNewMeeting = true;
    }
  }

  getEmptyMeeting(): Meeting {
    return {
      id: 0,
      title: '',
      type: 'Internal',
      company: '',
      companyId: 0,
      date: new Date().toISOString().slice(0, 10),
      time: '10:00',
      duration: '30 minutes',
      status: 'Upcoming',
      attendees: []
    };
  }

  addAttendee(): void {
    this.editingMeeting.attendees.push({
      name: '',
      role: '',
      company: ''
    });
  }

  removeAttendee(index: number): void {
    this.editingMeeting.attendees.splice(index, 1);
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    // Validate the form
    if (!this.editingMeeting.title) {
      this.error = 'Meeting title is required';
      return;
    }
    
    if (!this.editingMeeting.company && !this.editingMeeting.companyId) {
      this.error = 'Company is required';
      return;
    }
    
    // Clear any previous errors
    this.error = null;
    
    // If this is a new meeting, generate a new ID
    if (this.isNewMeeting) {
      this.editingMeeting.id = Date.now(); // Simple ID generation
    }
    
    // Link the company name and ID
    if (this.editingMeeting.companyId && !this.editingMeeting.company) {
      const company = this.companies.find(c => c.id === this.editingMeeting.companyId);
      if (company) {
        this.editingMeeting.company = company.name;
      }
    } else if (this.editingMeeting.company && !this.editingMeeting.companyId) {
      const company = this.companies.find(c => c.name === this.editingMeeting.company);
      if (company) {
        this.editingMeeting.companyId = company.id;
      }
    }
    
    this.onSave.emit(this.editingMeeting);
  }
}