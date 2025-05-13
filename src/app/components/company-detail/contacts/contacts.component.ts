// contacts.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Contact } from '../../../../model/types';
import { CompanyService } from '../../../services/company.service';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', '../company-details-tab-style.scss']
})
export class ContactsComponent implements OnInit {
  @Input() companyId?: number;
  contacts: Contact[] = [];
  displayedColumns: string[] = [
    'firstName', 
    'lastName', 
    'role', 
    'belongsTo', 
    'department',
    'telephone', 
    'mobile', 
    'email', 
    'actions'
  ];
  editingContact: Contact | null = null;

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.companyService.getContacts().subscribe(contacts => {
      this.contacts = contacts;
    });
  }

  openContactModal(): void {
    const dialogRef = this.dialog.open(ContactModalComponent, {
      width: '700px',
      data: { contact: null, isEditing: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.addContact(result.companyId, result);
      }
    });
  }

  editContact(contact: Contact): void {
    const dialogRef = this.dialog.open(ContactModalComponent, {
      width: '700px',
      data: { contact: {...contact}, isEditing: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.updateContact(contact.id, result);
      }
    });
  }

  deleteContact(contactId: number): void {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.companyService.deleteContact(contactId);
    }
  }
}
