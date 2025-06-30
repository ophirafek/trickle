import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { Company } from '../../../../model/types';
import { GLAccount } from '../../../../model/gl-account.model';
import { GLAccountService } from '../../../services/gl-account.service';
import { GeneralCode, GeneralCodeService } from '../../../services/general-codes.service';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from '../../../core/modules/material.module';
import { SharedModule } from '../../../core/modules/shared.module';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'app-gl-accounts',
  templateUrl: './gl-accounts.component.html',
  styleUrls: ['./gl-accounts.component.scss'],
  standalone: true,
  imports: [MaterialModule, SharedModule],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY',
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        }
      } },
  ]
})
export class GLAccountsComponent implements OnInit, OnChanges {
  @Input() company!: Company;
  
  // Table configuration
  displayedColumns: string[] = ['accountNumber', 'accountType', 'status', 'actions'];
  dataSource = new MatTableDataSource<GLAccount>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // GL Account data
  glAccounts: GLAccount[] = [];
  accountTypes: GeneralCode[] = [];
  
  // Form state
  accountForm: FormGroup;
  isAdding: boolean = false;
  isEditing: boolean = false;
  currentAccountId: number | null = null;
  
  // UI state
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private glAccountService: GLAccountService,
    private generalCodeService: GeneralCodeService,
    private translocoService: TranslocoService,
    private snackBar: MatSnackBar
  ) {
    // Initialize form
    this.accountForm = this.fb.group({
      accountNumber: ['', Validators.required],
      accountTypeCode: [null, Validators.required],
      openingEffecDate: [null],
      closingEffecDate: [null],
      activeFlag: [true]
    });
  }

  ngOnInit(): void {
    this.loadAccountTypes();
    if (this.company && this.company.id) {
      this.loadGLAccounts();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company'] && !changes['company'].firstChange && this.company && this.company.id) {
      this.loadGLAccounts();
    }
  }
  
  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  
  /**
   * Load account types from general codes
   */
  loadAccountTypes(): void {
    this.loading = true;
    
    const currentLang = this.translocoService.getActiveLang();
    const languageCode = currentLang === 'he' ? 2 : 1;
    
    this.generalCodeService.getCodesByType(35, languageCode)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (codes) => {
          this.accountTypes = codes.filter(code => code.isActive);
        },
        error: (err) => {
          console.error('Error loading account types:', err);
          this.error = this.translocoService.translate('COMPANY_DETAIL.GL_ACCOUNTS.LOAD_TYPES_ERROR');
        }
      });
  }
  
  /**
   * Load GL accounts for the current company
   */
  loadGLAccounts(): void {
    if (!this.company || !this.company.id) {
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    this.glAccountService.getCompanyGLAccounts(this.company.companyId)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (accounts) => {
          this.glAccounts = accounts;
          this.dataSource.data = this.glAccounts;
          
          // Apply paginator and sort if available
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        },
        error: (err) => {
          console.error('Error loading GL accounts:', err);
          this.error = this.translocoService.translate('COMPANY_DETAIL.GL_ACCOUNTS.LOAD_ERROR');
        }
      });
  }
  
  /**
   * Open dialog to add a new GL account
   */
  openAddDialog(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.currentAccountId = null;
    
    // Reset form with default values
    this.accountForm.reset({
      accountNumber: '',
      accountTypeCode: null,
      openingEffecDate: new Date(),
      closingEffecDate: null,
      activeFlag: true
    });
  }
  
  /**
   * Edit an existing GL account
   */
  editAccount(account: GLAccount): void {
    this.isEditing = true;
    this.isAdding = false;
    this.currentAccountId = account.id;
    
    // Set form values from account
    this.accountForm.patchValue({
      accountNumber: account.accountNumber,
      accountTypeCode: account.accountTypeCode,
      openingEffecDate: account.openingEffecDate ? new Date(account.openingEffecDate) : null,
      closingEffecDate: account.closingEffecDate ? new Date(account.closingEffecDate) : null,
      activeFlag: account.activeFlag
    });
  }
  
  /**
   * Cancel form and return to list view
   */
  cancelForm(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.currentAccountId = null;
    this.accountForm.reset();
  }
  
  /**
   * Save GL account (create or update)
   */
  saveAccount(): void {
    if (this.accountForm.invalid) {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.accountForm.controls).forEach(key => {
        const control = this.accountForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const formData = this.accountForm.value;
    
    // Create account object
    const account: GLAccount = {
      id: this.currentAccountId || 0,
      companyID: this.company.companyId,
      accountNumber: formData.accountNumber,
      accountTypeCode: formData.accountTypeCode,
      openingEffecDate: formData.openingEffecDate,
      closingEffecDate: formData.closingEffecDate,
      activeFlag: formData.activeFlag
    };
    
    this.loading = true;
    
    if (this.isAdding) {
      // Create new account
      this.glAccountService.createGLAccount(account)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (newAccount) => {
            this.handleSuccessResponse(
              newAccount, 
              'COMPANY_DETAIL.GL_ACCOUNTS.CREATE_SUCCESS', 
              'COMPANY_DETAIL.GL_ACCOUNTS.CREATE_ERROR'
            );
          },
          error: (err) => {
            this.handleErrorResponse(err, 'COMPANY_DETAIL.GL_ACCOUNTS.CREATE_ERROR');
          }
        });
    } else if (this.isEditing && this.currentAccountId) {
      // Update existing account
      this.glAccountService.updateGLAccount(this.currentAccountId, account)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            // Since the API might not return the updated account, we need to refresh the list
            this.loadGLAccounts();
            this.isEditing = false;
            this.currentAccountId = null;
            this.accountForm.reset();
            
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.GL_ACCOUNTS.UPDATE_SUCCESS'),
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          },
          error: (err) => {
            this.handleErrorResponse(err, 'COMPANY_DETAIL.GL_ACCOUNTS.UPDATE_ERROR');
          }
        });
    }
  }
  
  /**
   * Toggle account status (active/inactive)
   */
  toggleAccountStatus(account: GLAccount): void {
    if (!account.id) return;
    
    this.loading = true;
    
    if (account.activeFlag) {
      // Deactivate account
      this.glAccountService.deactivateGLAccount(account.id)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (updatedAccount) => {
            this.handleSuccessResponse(
              updatedAccount,
              'COMPANY_DETAIL.GL_ACCOUNTS.DEACTIVATE_SUCCESS',
              'COMPANY_DETAIL.GL_ACCOUNTS.DEACTIVATE_ERROR'
            );
          },
          error: (err) => {
            this.handleErrorResponse(err, 'COMPANY_DETAIL.GL_ACCOUNTS.DEACTIVATE_ERROR');
          }
        });
    } else {
      // Reactivate account - update the account with activeFlag = true
      const updatedAccount: GLAccount = { ...account, activeFlag: true };
      this.glAccountService.updateGLAccount(account.id, updatedAccount)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            // Refresh the list
            this.loadGLAccounts();
            
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.GL_ACCOUNTS.ACTIVATE_SUCCESS'),
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          },
          error: (err) => {
            this.handleErrorResponse(err, 'COMPANY_DETAIL.GL_ACCOUNTS.ACTIVATE_ERROR');
          }
        });
    }
  }
  
  /**
   * Handle successful API response
   */
  private handleSuccessResponse(
    account: GLAccount, 
    successMessageKey: string, 
    errorMessageKey: string
  ): void {
    if (account) {
      // Update the account in the local array or add it if it's new
      const index = this.glAccounts.findIndex(a => a.id === account.id);
      
      if (index !== -1) {
        this.glAccounts[index] = account;
      } else {
        this.glAccounts.push(account);
      }
      
      // Update the data source
      this.dataSource.data = this.glAccounts;
      
      // Reset form state
      this.isAdding = false;
      this.isEditing = false;
      this.currentAccountId = null;
      this.accountForm.reset();
      
      // Show success message
      this.snackBar.open(
        this.translocoService.translate(successMessageKey),
        this.translocoService.translate('BUTTONS.CLOSE'),
        { duration: 3000, panelClass: ['success-snackbar'] }
      );
    } else {
      // Handle unexpected response
      this.error = this.translocoService.translate(errorMessageKey);
    }
  }
  
  /**
   * Handle API error response
   */
  private handleErrorResponse(err: any, errorMessageKey: string): void {
    console.error('Error:', err);
    this.error = this.translocoService.translate(errorMessageKey);
    
    this.snackBar.open(
      this.translocoService.translate(errorMessageKey),
      this.translocoService.translate('BUTTONS.CLOSE'),
      { duration: 3000, panelClass: ['error-snackbar'] }
    );
  }
  
  /**
   * Get account type name from code
   */
  getAccountTypeName(accountTypeCode: number): string {
    const accountType = this.accountTypes.find(type => type.codeNumber === accountTypeCode);
    return accountType ? accountType.codeShortDescription : '';
  }
}