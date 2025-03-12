import { Component, Input } from '@angular/core';
import { Company } from '../../../model/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-card',
  templateUrl: './company-card.component.html',
  styleUrls: ['./company-card.component.css']
})
export class CompanyCardComponent {
  @Input() company!: Company;
  @Input() extended: boolean = false;

  constructor(private router: Router) {}

  navigateToCompany(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // If you're using the AppRoutingModule, uncomment this to navigate to the company detail page
    // this.router.navigate(['/companies', this.company.id]);
    
    // For now, we'll just trigger a custom event that could be handled by a parent component
    const customEvent = new CustomEvent('navigate-to-company', {
      bubbles: true,
      detail: { companyId: this.company.id }
    });
    event.target?.dispatchEvent(customEvent);
  }
}