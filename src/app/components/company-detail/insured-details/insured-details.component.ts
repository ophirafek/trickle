// Updated InsuredDetailsComponent without assignments logic
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Company } from '../../../../model/types';
import { GeneralCode, GeneralCodeService } from '../../../services/general-codes.service';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-insured-details',
  templateUrl: './insured-details.component.html',
  styleUrls: ['./insured-details.component.scss']
})
export class InsuredDetailsComponent implements OnInit, OnChanges {
  @Input() company!: Company;
  
  // General codes
  financialSizes: GeneralCode[] = [];
  companyStatuses: GeneralCode[] = [];
  
  // Form state
  selectedFinancialSize: number = 0;
  selectedStatus: number = 0;
  
  // UI control
  loading = false;

  constructor(
    private generalCodesService: GeneralCodeService,
    private translocoService: TranslocoService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company'] && !changes['company'].firstChange) {
      // Reset initial values when company changes
      this.setInitialValues();
    }
  }
  
  /**
   * Load all required data for the component
   */
  loadInitialData(): void {
    this.loading = true;
    
    // Load all required data in parallel
    forkJoin({
      financialSizes: this.generalCodesService.getCodesByType(60),
      companyStatuses: this.generalCodesService.getCodesByType(15),
    })
    .pipe(
      finalize(() => this.loading = false)
    )
    .subscribe(
      ({ financialSizes, companyStatuses }) => {
        this.financialSizes = financialSizes;
        this.companyStatuses = companyStatuses;
        
        // Set initial values from company
        this.setInitialValues();
      },
      error => console.error('Error loading initial data:', error)
    );
  }
  
  /**
   * Set initial form values based on company data
   */
  setInitialValues(): void {
    if (this.company) {
      // Set financial size
      this.selectedFinancialSize = this.company.insuredDetails?.sizeCode ?? 0;
      
      // Set company status
      this.selectedStatus = this.company.insuredDetails?.statusCode ?? 0;
    }
  }
  
  /**
   * Handle financial size change
   */
  onFinancialSizeChange(): void {
    if (this.company && this.selectedFinancialSize) {
      if (!this.company.insuredDetails) {
        this.company.insuredDetails = { sizeCode: this.selectedFinancialSize };
      } else {
        this.company.insuredDetails.sizeCode = this.selectedFinancialSize;
      }
    }
  }
  
  /**
   * Handle company status change
   */
  onStatusChange(): void {
    if (this.company && this.selectedStatus) {
      if (!this.company.insuredDetails) {
        this.company.insuredDetails = { statusCode: this.selectedStatus };
      } else {
        this.company.insuredDetails.statusCode = this.selectedStatus;
      }
      // You would typically call a service to save this change
    }
  }
  
  /**
   * Get the display name for a financial size code
   */
  getFinancialSizeDisplay(codeID: number): string {
    const code = this.financialSizes.find(s => s.codeNumber === codeID);
    return code?.codeShortDescription || '';
  }
  
  /**
   * Get the display name for a status code
   */
  getStatusDisplay(codeID: number): string {
    const code = this.companyStatuses.find(s => s.codeNumber === codeID);
    return code?.codeShortDescription || '';
  }
}