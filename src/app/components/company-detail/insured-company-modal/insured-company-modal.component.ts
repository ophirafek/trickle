import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-assignment-modal',
  templateUrl: './insured-company-modal.component.html',

  styleUrls: ['./insured-company-modal.component.scss', '../company-details-tab-style.scss'],
})
export class InsuredCompanyModalComponent implements OnInit {
  assignmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InsuredCompanyModalComponent>
  ) {
    this.assignmentForm = this.fb.group({
      assignmentType: ['Client Portfolio Manager'],
      employee: ['David Wilson']
    });
  }

  ngOnInit(): void {
  }

  saveAssignment(): void {
    if (this.assignmentForm.valid) {
      this.dialogRef.close(this.assignmentForm.value);
    }
  }
}