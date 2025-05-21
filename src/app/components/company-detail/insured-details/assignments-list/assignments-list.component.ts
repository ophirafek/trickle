// assignments-list.component.ts
import { Component, OnInit, ViewChild, TemplateRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Company } from '../../../../../model/types';
import { Assignment } from '../../../../../model/assignment.model';
import { Employee } from '../../../../../model/md-types';
import { AssignmentsService } from '../../../../services/assignments.service';
import { GeneralCode, GeneralCodeService } from '../../../../services/general-codes.service';
import { EmployeeService } from '../../../../services/employee.service';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

interface NewAssignment {
  assignmentTypeCode: number;
  employeeID: number;
}

@Component({
  selector: 'app-assignments-list',
  templateUrl: './assignments-list.component.html',
  styleUrls: ['./assignments-list.component.scss']
})
export class AssignmentsListComponent implements OnInit, OnChanges {
  @Input() company!: Company;
  
  // General codes
  assignmentTypes: GeneralCode[] = [];
  
  // Employees and assignments
  employees: Employee[] = [];
  companyAssignments: Assignment[] = [];
  
  // UI control
  loading = false;
  
  // New assignment dialog
  newAssignment: NewAssignment = {
    assignmentTypeCode: 0,
    employeeID: 0
  };
  
  @ViewChild('assignmentDialog') assignmentDialog!: TemplateRef<any>;
  @ViewChild('editAssignmentDialog') editAssignmentDialog!: TemplateRef<any>;

  // For editing
  editingAssignment: Assignment | null = null;

  constructor(
    private assignmentsService: AssignmentsService,
    private generalCodesService: GeneralCodeService,
    private employeesService: EmployeeService,
    private dialog: MatDialog,
    private translocoService: TranslocoService,
    private snackBar: MatSnackBar
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
    
    // Load assignment types and employees in parallel
    Promise.all([
      this.generalCodesService.getCodesByType(90).toPromise(),
      this.employeesService.getEmployees().toPromise()
    ]).then(([assignmentTypes, employees]) => {
      this.assignmentTypes = assignmentTypes || [];
      this.employees = employees || [];
      
      // Load assignments
      this.loadCompanyAssignments();
    }).catch(error => {
      console.error('Error loading initial data:', error);
      this.snackBar.open(
        this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.LOAD_ERROR'),
        this.translocoService.translate('BUTTONS.CLOSE'),
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    }).finally(() => {
      this.loading = false;
    });
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
        error => {
          console.error('Error loading assignments:', error);
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.LOAD_ERROR'),
            this.translocoService.translate('BUTTONS.CLOSE'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      );
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
   * Open dialog to edit an existing assignment
   */
  openEditDialog(assignment: Assignment): void {
    this.editingAssignment = { ...assignment };
    
    const dialogRef = this.dialog.open(this.editAssignmentDialog, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateAssignment(result);
      }
      this.editingAssignment = null;
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
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.CREATE_SUCCESS'),
            this.translocoService.translate('BUTTONS.CLOSE'),
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error => {
          console.error('Error creating assignment:', error);
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.CREATE_ERROR'),
            this.translocoService.translate('BUTTONS.CLOSE'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      );
  }
  
  /**
   * Deactivate an assignment
   */
  deactivateAssignment(id: number): void {
    if (confirm(this.translocoService.translate('COMMON.CONFIRM_DELETE'))) {
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
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.DEACTIVATE_SUCCESS'),
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          },
          error => {
            console.error('Error deactivating assignment:', error);
            this.snackBar.open(
              this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.DEACTIVATE_ERROR'),
              this.translocoService.translate('BUTTONS.CLOSE'),
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
        );
    }
  }
  
  /**
   * Update an employee assignment
   */
  updateAssignment(assignment: Assignment): void {
    this.loading = true;
    this.assignmentsService.updateAssignment(assignment)
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
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.UPDATE_SUCCESS'),
            this.translocoService.translate('BUTTONS.CLOSE'),
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error => {
          console.error('Error updating assignment:', error);
          this.snackBar.open(
            this.translocoService.translate('COMPANY_DETAIL.INSURED_INFO.ASSIGNMENTS.UPDATE_ERROR'),
            this.translocoService.translate('BUTTONS.CLOSE'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      );
  }

  /**
   * Change the employee for an assignment
   * @param assignment The assignment to update
   * @param newEmployeeId The new employee ID
   */
  changeEmployeeAssignment(assignment: Assignment, newEmployeeId: number): void {
    const updatedAssignment: Assignment = {
      ...assignment,
      employeeID: newEmployeeId
    };
    
    this.updateAssignment(updatedAssignment);
  }

  /**
   * Get assignment type name from code
   */
  getAssignmentTypeName(code: number): string {
    const type = this.assignmentTypes.find(t => t.codeNumber === code);
    return type?.codeShortDescription || '';
  }

  /**
   * Get employee name from ID
   */
  getEmployeeName(id: number): string {
    const employee = this.employees.find(e => e.id === id);
    return employee?.name || '';
  }

  /**
   * Get employee department from ID
   */
  getEmployeeDepartment(id: number): string {
    const employee = this.employees.find(e => e.id === id);
    return employee?.department || '';
  }
}