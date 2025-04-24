// src/app/components/header/header.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() showMenuToggle: boolean = false;
  @Output() menuToggle = new EventEmitter<void>();
  
  currentLang: string = 'en';
  
  constructor(private translocoService: TranslocoService) {}
  
  ngOnInit(): void {
    // Get current language
    this.currentLang = this.translocoService.getActiveLang();
    
    // Subscribe to language changes
    this.translocoService.langChanges$.subscribe(lang => {
      this.currentLang = lang;
    });
  }
  
  toggleMenu(): void {
    this.menuToggle.emit();
  }
  
  changeLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
  }
}