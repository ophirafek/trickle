import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  activeTab = 'dashboard';
  isDetailView = false;
  isSidenavOpen = true;
  
  menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'companies', icon: 'business', label: 'Companies' },
    { id: 'leads', icon: 'track_changes', label: 'Leads' },
    { id: 'meetings', icon: 'event', label: 'Meetings' }
  ];
  
  setDetailViewState(isActive: boolean): void {
    this.isDetailView = isActive;
  }
  
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}