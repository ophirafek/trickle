import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Lead, Company } from '../../../model/types';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.css']
})
export class LeadDetailComponent implements OnInit {
  @Input() lead: Lead | null = null;
  @Input() isOpen: boolean = false;
  @Input() companies: Company[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Lead>();

  editingLead: Lead = this.getEmptyLead();
  isNewLead: boolean = true;

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
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
      title: '',
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
    // Update last update timestamp
    this.editingLead.lastUpdate = 'just now';
    
    // In a real app, would validate the form here
    this.onSave.emit(this.editingLead);
    this.close();
  }
}
