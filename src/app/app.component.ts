import { Component } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { MaterialModule } from './core/modules/material.module';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SharedModule } from './core/modules/shared.module';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [MaterialModule, RouterOutlet, HeaderComponent, SharedModule, RouterLink],
  standalone: true
})
export class AppComponent {
  isSidenavOpen = true;

  menuItems = [
    { id: 'dashboard', route: '/dashboard', icon: 'dashboard', label: 'MENU.DASHBOARD' },
    { id: 'companies', route: '/companies', icon: 'business', label: 'MENU.COMPANIES' },
    { id: 'leads', route: '/leads', icon: 'track_changes', label: 'MENU.LEADS' },
    { id: 'tasks', route: '/tasks', icon: 'assignment', label: 'MENU.TASKS' },
    { id: 'meetings', route: '/meetings', icon: 'event', label: 'MENU.MEETINGS' }
  ];

  constructor(private translocoService: TranslocoService) {
    // Get saved language preference
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && ['en', 'he'].includes(savedLang)) {
      this.translocoService.setActiveLang(savedLang);
    }

    // Set direction based on language
    this.setDirectionForLanguage(this.translocoService.getActiveLang());

    // Listen for language changes
    this.translocoService.langChanges$.subscribe(lang => {
      this.setDirectionForLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
    });
  }

  private setDirectionForLanguage(lang: string): void {
    // Set RTL direction for Hebrew
    const isRtl = lang === 'he';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRtl);
  }
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}