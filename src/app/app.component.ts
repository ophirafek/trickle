import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  activeTab = 'dashboard';
  
  menuItems = [
    { id: 'dashboard', icon: 'fas fa-building', label: 'Dashboard' },
    { id: 'companies', icon: 'fas fa-users', label: 'Companies' },
    { id: 'leads', icon: 'fas fa-bullseye', label: 'Leads' },
    { id: 'meetings', icon: 'fas fa-calendar', label: 'Meetings' }
  ];
}