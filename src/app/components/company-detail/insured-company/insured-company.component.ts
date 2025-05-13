// insured.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Company } from '../../../../model/types';
import { InsuredCompanyModalComponent } from '../insured-company-modal/insured-company-modal.component';

@Component({
  selector: 'app-insured-company',
  templateUrl: './insured-company.component.html',
  styleUrls: ['./insured-company.component.scss']
})
export class InsuredCompanyComponent implements OnInit {
  @Input() company: Company | null = null;
  
  financialSizeForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.financialSizeForm = this.fb.group({
      financialSize: ['medium'],
      status: ['active']
    });
  }

  ngOnInit(): void {
    // Initialize form based on company if needed
  }

  openAssignmentModal(): void {
    const dialogRef = this.dialog.open(InsuredCompanyModalComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle the assignment result
    });
  }
}