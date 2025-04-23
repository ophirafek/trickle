import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isSidenavOpen = true;
  
  menuItems = [
    { id: 'dashboard', route: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'companies', route: '/companies', icon: 'business', label: 'Companies' },
    { id: 'leads', route: '/leads', icon: 'track_changes', label: 'Leads' },
    { id: 'meetings', route: '/meetings', icon: 'event', label: 'Meetings' }
  ];
  
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}