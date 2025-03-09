import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Company } from '../../../model/types';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css']
})
export class CompanyDetailComponent implements OnInit {
  @Input() company: Company | null = null;
  @Input() isVisible: boolean = false;
  @Input() activeTab: 'general' | 'address' | 'contacts' | 'notes' = 'general';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Company>();

  editingCompany: Company = this.getEmptyCompany();
  isNewCompany: boolean = true;

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
  }

  resetForm(): void {
    if (this.company) {
      // Create a copy to avoid modifying the original object
      this.editingCompany = { ...this.company };
      this.isNewCompany = false;
    } else {
      this.editingCompany = this.getEmptyCompany();
      this.isNewCompany = true;
    }
  }

  getEmptyCompany(): Company {
    return {
      name: '',
      industry: '',
      size: '100-500 employees',
      location: '',
      website: ''
    };
  }



  close(): void {
    this.onClose.emit();
  }

  save(): void {
    // In a real app, would validate the form here
    this.onSave.emit(this.editingCompany);
    this.close();
  }
}