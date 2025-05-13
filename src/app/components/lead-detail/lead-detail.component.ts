import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Lead, Company } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit {
  @Input() lead: Lead | null = null;
  @Input() isOpen: boolean = false;
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
    }
  }

  getEmptyLead(): Lead {
    return {
      id: 0,
      leadTypeCode: 1,
      salesGapValue: 0,
      contactName: '',
      leadName: '',
      company: '',
      status: 'New',
      value: 0,
      probability: 0,
      owner: '',
      lastUpdate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    // Validate the form
    if (!this.editingLead.leadName) {
      this.error = 'Lead title is required';
      return;
    }
    
    if (!this.editingLead.company) {
      this.error = 'Company is required';
      return;
    }
    
    // Clear any previous errors
    this.error = null;
    
    // Update last update timestamp
    this.editingLead.lastUpdate = 'just now';
    
    // In a real app, would validate the form here
    this.onSave.emit(this.editingLead);
  }
}