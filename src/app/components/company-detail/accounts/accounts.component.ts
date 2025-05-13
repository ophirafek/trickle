// accounts.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Account } from '../../../../model/types';
import { CompanyService } from '../../../services/company.service';
import { AccountModalComponent } from '../account-modal/account-modal.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss', '../company-details-tab-style.scss']
})
export class AccountsComponent implements OnInit {
  @Input() companyId?: number;
  accounts: Account[] = [];
  displayedColumns: string[] = ['accountNumber', 'accountType', 'status', 'actions'];
  editingAccount: Account | null = null;

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.companyService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
    });
  }

  openAccountModal(): void {
    const dialogRef = this.dialog.open(AccountModalComponent, {
      width: '500px',
      data: { account: null, isEditing: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.addAccount(result);
      }
    });
  }

  editAccount(account: Account): void {
    const dialogRef = this.dialog.open(AccountModalComponent, {
      width: '500px',
      data: { account: {...account}, isEditing: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.updateAccount(result);
      }
    });
  }

  deleteAccount(accountId: number): void {
    if (confirm('Are you sure you want to delete this account?')) {
      this.companyService.deleteAccount(accountId);
    }
  }
}
