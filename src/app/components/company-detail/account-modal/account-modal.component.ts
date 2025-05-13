import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Account } from '../../../../model/types';
@Component({
  selector: 'app-account-modal',
  templateUrl: './account-modal.component.html',
  styleUrls: [`./account-modal.component.scss`],
    

})
export class AccountModalComponent implements OnInit {
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AccountModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { account: Account | null, isEditing: boolean }
  ) {
    this.accountForm = this.fb.group({
      id: [null],
      accountNumber: [data.isEditing ? '' : 'ACC-', Validators.required],
      accountType: ['Business', Validators.required],
      status: ['Active']
    });

    if (data.account) {
      this.accountForm.patchValue(data.account);
    }
  }

  ngOnInit(): void {
  }

  saveAccount(): void {
    if (this.accountForm.valid) {
      this.dialogRef.close(this.accountForm.value);
    }
  }
}