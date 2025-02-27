import { Component, Input } from '@angular/core';
import { Company } from '../../../model/types';

@Component({
  selector: 'app-company-card',
  templateUrl: './company-card.component.html',
  styleUrls: ['./company-card.component.css']
})
export class CompanyCardComponent {
  @Input() company!: Company;
  @Input() extended: boolean = false;
}
