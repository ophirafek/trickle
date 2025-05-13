import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogContent } from "@angular/material/dialog";
import { Contact } from "../../../../model/types";

@Component({
  selector: 'app-contact-modal',
  templateUrl: './contact-modal.component.html', 
  styleUrls: [`./contact-modal.component.scss`],
    

})
export class ContactModalComponent implements OnInit {
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ContactModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contact: Contact | null, isEditing: boolean }
  ) {
    this.contactForm = this.fb.group({
      id: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: [''],
      belongsTo: ['insured'],
      department: [''],
      telephone: [''],
      mobile: [''],
      email: ['', Validators.email],
      notes: ['']
    });

    if (data.contact) {
      this.contactForm.patchValue(data.contact);
    }
  }

  ngOnInit(): void {
  }

  saveContact(): void {
    if (this.contactForm.valid) {
      this.dialogRef.close(this.contactForm.value);
    }
  }
}