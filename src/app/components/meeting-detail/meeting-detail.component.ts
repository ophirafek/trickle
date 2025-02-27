import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Meeting, Attendee } from '../../../model/types';

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

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
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
    // In a real app, would validate the form here
    
    // If this is a new meeting, generate a new ID
    if (this.isNewMeeting) {
      this.editingMeeting.id = Date.now(); // Simple ID generation
    }
    
    this.onSave.emit(this.editingMeeting);
    this.close();
  }
}