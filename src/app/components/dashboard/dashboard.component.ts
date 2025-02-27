import { Component, OnInit } from '@angular/core';
import { Company, Meeting } from '../../../model/types'
import { DataService } from '../../services/data.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  companies: Company[] = [];
  meetings: Meeting[] = [];

  quickActions = [
    { icon: 'fas fa-plus', label: 'New Company', color: 'blue' },
    { icon: 'fas fa-bullseye', label: 'Create Lead', color: 'green' },
    { icon: 'fas fa-calendar', label: 'Schedule Meeting', color: 'purple' },
    { icon: 'fas fa-comment', label: 'Add Note', color: 'orange' }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.companies = this.dataService.getCompanies();
    this.meetings = this.dataService.getMeetings();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}