// company-additional-info.component.ts
import { Component, OnInit, ViewChild, TemplateRef, Input, OnChanges, SimpleChanges, model } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Company } from '../../../../model/types'
import { Assignment } from '../../../../model/assignment.model';
import { Employee } from '../../../../model/md-types';
import { AssignmentsService } from '../../../services/assignments.service';
import { GeneralCode, GeneralCodeService } from '../../../services/general-codes.service';
import { EmployeeService } from '../../../services/employee.service';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

interface NewAssignment {
  assignmentTypeCode: number;
  employeeID: number;
}

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
  assignmentTypes: GeneralCode[] = [];
  
  // Employees and assignments
  employees: Employee[] = [];
  companyAssignments: Assignment[] = [];
  
  // Form state
  selectedFinancialSize: number = 0;
  selectedStatus: number = 0;
  
  // UI control
  loading = false;
  
  // New assignment dialog
  newAssignment: NewAssignment = {
    assignmentTypeCode: 0,
    employeeID: 0
  };
  
  @ViewChild('assignmentDialog') assignmentDialog!: TemplateRef<any>;

  constructor(
    private assignmentsService: AssignmentsService,
    private generalCodesService: GeneralCodeService,
    private employeesService: EmployeeService,
    private dialog: MatDialog,
    private translocoService: TranslocoService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company'] && !changes['company'].firstChange) {
      // Load assignments when company changes
      this.loadCompanyAssignments();
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
      assignmentTypes: this.generalCodesService.getCodesByType(90),
      employees: this.employeesService.getEmployees()
    })
    .pipe(
      finalize(() => this.loading = false)
    )
    .subscribe(
      ({ financialSizes, companyStatuses, assignmentTypes, employees }) => {
        this.financialSizes = financialSizes;
        this.companyStatuses = companyStatuses;
        this.assignmentTypes = assignmentTypes;
        this.employees = employees;
        
        // Set initial values from company
        this.setInitialValues();
        
        // Load assignments
        this.loadCompanyAssignments();
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
   * Load assignments for the current company
   */
  loadCompanyAssignments(): void {
    if (!this.company || !this.company.id) {
      this.companyAssignments = [];
      return;
    }
    
    this.loading = true;
    this.assignmentsService.getCompanyAssignments(this.company.id)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        assignments => {
          this.companyAssignments = assignments;
        },
        error => console.error('Error loading assignments:', error)
      );
  }
  
  /**
   * Handle financial size change
   */
  onFinancialSizeChange(): void {
    if (this.company && this.selectedFinancialSize) {
      if (this.company.insuredDetails)
      {
          this.company.insuredDetails.sizeCode = this.selectedFinancialSize;

      }
    }
  }
  
  /**
   * Handle company status change
   */
  onStatusChange(): void {
    if (this.company && this.selectedStatus) {
      if (this.company.insuredDetails) {
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
  
  /**
   * Open dialog to add a new assignment
   */
  openAssignmentDialog(): void {
    // Reset the new assignment
    this.newAssignment = {
      assignmentTypeCode: 0,
      employeeID: 0
    };
    
    const dialogRef = this.dialog.open(this.assignmentDialog, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveNewAssignment(result);
      }
    });
  }
  
  /**
   * Save a new assignment
   */
  saveNewAssignment(assignmentData: NewAssignment): void {
    if (!this.company || !this.company.id) {
      return;
    }
    
    const newAssignment: Assignment = {
      id: 0, // Will be set by the server
      companyID: this.company.id,
      assignmentTypeCode: assignmentData.assignmentTypeCode,
      employeeID: assignmentData.employeeID,
      openingEffecDate: new Date(),
      openingRegDate: new Date(),
      activeFlag: 1
    };
    
    this.loading = true;
    this.assignmentsService.createAssignment(newAssignment)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        createdAssignment => {
          this.companyAssignments.push(createdAssignment);
        },
        error => console.error('Error creating assignment:', error)
      );
  }
  
  /**
   * Deactivate an assignment
   */
  deactivateAssignment(id: number): void {
    this.loading = true;
    this.assignmentsService.deactivateAssignment(id)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        updatedAssignment => {
          // Update the assignment in the list
          const index = this.companyAssignments.findIndex(a => a.id === id);
          if (index !== -1) {
            this.companyAssignments[index] = updatedAssignment;
          }
        },
        error => console.error('Error deactivating assignment:', error)
      );
  }
  
  /**
   * Update an employee assignment
   */
  updateAssignment(assignment: Assignment, newEmployeeId: number): void {
    const updatedAssignment: Assignment = {
      ...assignment,
      employeeID: newEmployeeId
    };
    
    this.loading = true;
    this.assignmentsService.updateAssignment(updatedAssignment)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        result => {
          // Update the assignment in the list
          const index = this.companyAssignments.findIndex(a => a.id === assignment.id);
          if (index !== -1) {
            this.companyAssignments[index] = result;
          }
        },
        error => console.error('Error updating assignment:', error)
      );
  }
}