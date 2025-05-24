import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit, OnChanges {
  @Input() lead: Lead | null = null;
  @Input() isOpen: boolean = false;
  @Input() preSelectedCompanyId: number | null = null;
  @Input() preSelectedCompanyName: string | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Lead>();

  editingLead: Lead = this.getEmptyLead();
  isNewLead: boolean = true;
  companies: Company[] = [];
  
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private companyService: CompanyService,
    private snackBar: MatSnackBar
  ) {}

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
          
          // Pre-select company if provided
          if (this.preSelectedCompanyId && this.isNewLead) {
            this.editingLead.companyId = this.preSelectedCompanyId;
            // Find the company name for display
            const selectedCompany = companies.find(c => c.id === this.preSelectedCompanyId);
            if (selectedCompany) {
              this.editingLead.companyName = selectedCompany.registrationName;
            }
          }
        },
        error: (err) => {
          this.error = 'Failed to load companies. Please try again later.';
          this.loading = false;
          console.error('Error loading companies:', err);
        }
      });
  }

  resetForm(): void {
    if (this.lead) {
      // Create a copy to avoid modifying the original object
      this.editingLead = { ...this.lead };
      this.isNewLead = false;
    } else {
      this.editingLead = this.getEmptyLead();
      this.isNewLead = true;
      
      // Pre-select company if provided
      if (this.preSelectedCompanyId && this.preSelectedCompanyName) {
        this.editingLead.companyId = this.preSelectedCompanyId;
        this.editingLead.companyName = this.preSelectedCompanyName;
      }
    }
  }