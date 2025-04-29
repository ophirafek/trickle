import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Company, Employee, ImportResult } from '../../../model/types';
import { CompanyService } from '../../services/company.service';
import { EmployeeService } from  '../../services/employees.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemePalette } from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TranslocoService } from '@ngneat/transloco';
@Component({
  selector: 'app-company-import',
  templateUrl: './company-import.component.html',
  styleUrls: ['./company-import.component.scss']
})
export class CompanyImportComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  fileSelected: boolean = false;
  fileName: string = '';
  fileSize: string = '';
  fileIcon: string = '';
  parseError: string = '';
  previewData: any[] = [];
  previewHeaders: string[] = [];
  fieldMapping: { [key: string]: string } = {};
  showOnlyRowsWithErrors: boolean = false;
  
  importResults: ImportResult[] = [];
  importProgress: number = 0;
  importSummary: {
    totalProcessed: number;
    successful: number;
    existingCompanies: number;
    existingLeads: number;
    errors: number;
  } = {
    totalProcessed: 0,
    successful: 0,
    existingCompanies: 0,
    existingLeads: 0,
    errors: 0
  };
  isImporting: boolean = false;
  // Track current step in the import process
  // Track current step in the import process
  currentStep: 'file-selection' | 'mandatory-mapping' | 'optional-mapping' | 'review' | 'results' = 'file-selection';
  
  // Track which rows are selected for import
  selectedRows: boolean[] = [];
  allRowsSelected: boolean = true;
  
  // Track which rows have issues (missing required fields, etc.)
  rowIssues: { index: number, issues: string[] }[] = [];
  
  // Mandatory fields (must be mapped)
  mandatoryFields = [
    { key: 'name', label: 'Company Name' },
    { key: 'registrationNumber', label: 'Registration Number' }
  ];
  
  // Optional fields
  optionalFields = [
    { key: 'dunsNumber', label: 'DUNS Number' },
    { key: 'streetAddress', label: 'Street Address' },
    { key: 'city', label: 'City' },
    { key: 'postalCode', label: 'ZIP/Postal Code' },
    { key: 'website', label: 'Web Address' }
  ];
  
  // Combined fields for review display
 
  public fileData: any[] = [];
  private selectedFile: File | null = null;
  employees: Employee[] = [];
  companyTeamAssignments: { [key: number]: number } = {}; // Maps row index to employee ID
  // Combined fields for review display
  get displayFields() {
    return [...this.mandatoryFields, ...this.optionalFields].filter(field => 
      // Only include fields that have been mapped
      !!this.fieldMapping[field.key]
    );
  }
  
  // Update the displayedColumns to use displayFields
  get displayedColumns(): string[] {
    const fieldColumns = this.displayFields.map(f => f.key).filter(key => !!key);
    return ['select', 'teamAssignment', ...fieldColumns, 'status'];
  }
  
  // Loading state
  loading: boolean = false;
  
  constructor(
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private translocoService: TranslocoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize component
      // Initialize component
  this.mandatoryFields = [
    { key: 'name', label: 'COMPANY_DETAIL.COMPANY_NAME'},
    { key: 'registrationNumber', label: 'COMPANY_DETAIL.REGISTRATION_NUMBER' }
  ];
  
  this.optionalFields = [
    { key: 'dunsNumber', label: 'COMPANY_DETAIL.DUNS_NUMBER' },
    { key: 'streetAddress', label: 'COMPANY_DETAIL.STREET_ADDRESS' },
    { key: 'city', label: 'COMPANY_DETAIL.CITY' },
    { key: 'postalCode', label: 'COMPANY_DETAIL.POSTAL_CODE' },
    { key: 'website', label: 'COMPANY_DETAIL.WEBSITE' }
  ];
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.snackBar.open('Failed to load employees list', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  get canProceedToMandatoryMapping(): boolean {
    return this.fileSelected && 
           this.previewData.length > 0 && 
           !this.parseError;
  }
  
  get canProceedToOptionalMapping(): boolean {
    // Check if all mandatory fields are mapped
    return this.mandatoryFields.every(field => !!this.fieldMapping[field.key]);
  }
  
  get canProceedToReview(): boolean {
    // Optional fields don't need to be mapped to proceed
    return this.canProceedToOptionalMapping;
  }
  
  get canImport(): boolean {
    return this.selectedRows.some(row => row) && 
           this.currentStep === 'review';
  }
  
  get selectedRowCount(): number {
    return this.selectedRows.filter(selected => selected).length;
  }

  get filteredFileData(): any[] {
    if (!this.showOnlyRowsWithErrors) {
      return this.fileData;
    }
    
    // Return only rows with issues
    return this.fileData.filter((_, index) => this.hasIssues(index));
  }
  
  // Toggle the error filter
  toggleErrorFilter(): void {
    this.showOnlyRowsWithErrors = !this.showOnlyRowsWithErrors;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile = input.files[0];
    this.fileName = this.selectedFile.name;
    this.fileSize = this.formatFileSize(this.selectedFile.size);
    this.fileSelected = true;
    
    // Set icon based on file type
    if (this.fileName.endsWith('.csv')) {
      this.fileIcon = 'fas fa-file-csv text-green-500';
    } else if (this.fileName.endsWith('.json')) {
      this.fileIcon = 'fas fa-file-code text-orange-500';
    } else {
      this.fileIcon = 'fas fa-file text-gray-500';
    }

    this.parseFile();
  }

  resetFile(): void {
    this.fileSelected = false;
    this.fileName = '';
    this.fileSize = '';
    this.fileIcon = '';
    this.parseError = '';
    this.previewData = [];
    this.previewHeaders = [];
    this.fieldMapping = {};
    this.fileData = [];
    this.selectedFile = null;
    this.currentStep = 'file-selection';
    this.selectedRows = [];
    this.allRowsSelected = true;
    this.rowIssues = [];
    
    // Reset stepper
    if (this.stepper) {
      this.stepper.reset();
    }
  }

  parseFile(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (this.fileName.endsWith('.csv')) {
          this.parseCSV(content);
        } else if (this.fileName.endsWith('.json')) {
          this.parseJSON(content);
        } else {
          this.parseError = 'Unsupported file format';
        }
      } catch (error) {
        this.parseError = 'Error parsing file. Please check the file format.';
        console.error('Parse error:', error);
      }
    };

    reader.onerror = () => {
      this.parseError = 'Error reading file';
    };

    if (this.fileName.endsWith('.csv') || this.fileName.endsWith('.json')) {
      reader.readAsText(this.selectedFile);
    } else {
      this.parseError = 'Unsupported file format';
    }
  }

  parseCSV(content: string): void {
    // Simple CSV parsing - in a real app, use a library like papaparse
    const lines = content.split('\n');
    if (lines.length <= 1) {
      this.parseError = 'File appears to be empty or invalid';
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    this.previewHeaders = headers;
    
    this.fileData = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      this.fileData.push(rowData);
    }
    
    this.previewData = this.fileData.slice(0, 5); // Show first 5 rows for preview
    this.selectedRows = new Array(this.fileData.length).fill(true);
    this.allRowsSelected = true;
  }

  parseJSON(content: string): void {
    try {
      this.fileData = JSON.parse(content);
      
      if (!Array.isArray(this.fileData) || this.fileData.length === 0) {
        this.parseError = 'Invalid JSON format. Expected an array of objects.';
        return;
      }
      
      // Get all possible headers from all objects
      const headerSet = new Set<string>();
      this.fileData.forEach(row => {
        Object.keys(row).forEach(key => headerSet.add(key));
      });
      
      this.previewHeaders = Array.from(headerSet);
      this.previewData = this.fileData.slice(0, 5); // Show first 5 rows for preview
      this.selectedRows = new Array(this.fileData.length).fill(true);
      this.allRowsSelected = true;
    } catch (error) {
      this.parseError = 'Invalid JSON format';
    }
  }

  proceedToMandatoryMapping(): void {
    this.currentStep = 'mandatory-mapping';
  }
  
  proceedToOptionalMapping(): void {
    this.currentStep = 'optional-mapping';
  }
  
  proceedToReview(): void {
    this.currentStep = 'review';
    this.validateRows();
  }
  

  goBack(): void {
    if (this.currentStep === 'mandatory-mapping') {
      this.currentStep = 'file-selection';
    } else if (this.currentStep === 'optional-mapping') {
      this.currentStep = 'mandatory-mapping';
    } else if (this.currentStep === 'review') {
      this.currentStep = 'optional-mapping';
    }
  }
  
  validateRows(): void {
    this.rowIssues = [];
    
    this.fileData.forEach((row, index) => {
      const issues: string[] = [];
      
      // Validate mandatory fields
      this.mandatoryFields.forEach(field => {
        const sourceField = this.fieldMapping[field.key];
        const value = row[sourceField];
        
        if (!value || value.trim() === '') {
          // Use transloco for error message
          issues.push(this.translocoService.translate('IMPORT.VALIDATION_ERRORS.MISSING_FIELD', { 
            field: this.translocoService.translate(field.label) 
          }));
        }
      });
      
      // We don't validate optional fields as they are optional
      
      if (issues.length > 0) {
        this.rowIssues.push({ index, issues });
      }
    });
  }

  toggleAllRows(): void {
    this.selectedRows.fill(this.allRowsSelected);
  }
  
  toggleRow(index: number): void {
    this.selectedRows[index] = !this.selectedRows[index];
    this.updateAllRowsSelectedState();
  }
  
  updateAllRowsSelectedState(): void {
    this.allRowsSelected = this.selectedRows.every(selected => selected);
  }

  importCompanies(): void {
    if (!this.canImport) return;
    
    const selectedData = this.fileData.filter((_, index) => this.selectedRows[index]);
    const mappedCompanies: Company[] = selectedData.map(row => {
      const company: any = {};
      
      // Map mandatory fields
      this.mandatoryFields.forEach(field => {
        const sourceField = this.fieldMapping[field.key];
        company[field.key] = row[sourceField] || '';
      });
      
      // Map optional fields (only if they have been mapped)
      this.optionalFields.forEach(field => {
        const sourceField = this.fieldMapping[field.key];
        if (sourceField) { // Only set if mapped
          company[field.key] = row[sourceField] || '';
        }
      });
      
      const originalIndex = this.fileData.indexOf(row);
      if (this.companyTeamAssignments[originalIndex]) {
        company.assignedTeamMemberId = this.companyTeamAssignments[originalIndex];
        
        // Get employee info for reference
        const employee = this.employees.find(e => e.id === this.companyTeamAssignments[originalIndex]);
        if (employee) {
          company.assignedTeamMemberName = employee.name;
        }
      }
      return company as Company;
    });
    
    // Reset import state
    this.importResults = [];
    this.importProgress = 0;
    this.importSummary = {
      totalProcessed: 0,
      successful: 0,
      existingCompanies: 0,
      existingLeads: 0,
      errors: 0
    };
    this.isImporting = true;
    this.loading = true;
    
    // Import companies sequentially
    this.importCompaniesSequentially(mappedCompanies, 0);
  }

  importCompaniesSequentially(companies: Company[], index: number): void {
    this.stepper.selected!.completed = true;
    if (index >= companies.length) {
      // All companies processed
      this.loading = false;
      this.isImporting = false;
      if (this.stepper) {
        this.stepper.next(); // This advances to the Results step
      }
  
      this.snackBar.open(
        this.translocoService.translate('IMPORT.PROCESSED_COMPANIES', { count: this.importSummary.totalProcessed }),
        this.translocoService.translate('BUTTONS.CLOSE'),
        {
          duration: 5000,
          panelClass: this.importSummary.errors > 0 ? ['warning-snackbar'] : ['success-snackbar']
        }
      );
      return;
    }
    
    const company = companies[index];
    
    this.companyService.importSingleCompany(company).subscribe({
      next: (result) => {
        // Add result to our results array
        this.importResults.push(result);
        
        // Update summary based on status
        this.importSummary.totalProcessed++;
        switch (result.status) {
          case 0: // Success
            this.importSummary.successful++;
            break;
          case 1: // Company exists, lead created
            this.importSummary.existingCompanies++;
            break;
          case 2: // Both company and lead exist
            this.importSummary.existingLeads++;
            break;
          case 3: // Error
            this.importSummary.errors++;
            break;
        }
        
        // Update progress
        this.importProgress = Math.round((index + 1) / companies.length * 100);
        
        // Process next company
        setTimeout(() => {
          this.importCompaniesSequentially(companies, index + 1);
        }, 100); // Small delay to avoid overwhelming the server
      },
      error: () => {
        // This shouldn't happen since we're handling errors in the service
        // But just in case, add a generic error result
        this.importResults.push({
          status: 3,
          companyName: company.name,
          errorMessage: 'Unknown error occurred'
        });
        this.importSummary.totalProcessed++;
        this.importSummary.errors++;
        
        // Update progress
        this.importProgress = Math.round((index + 1) / companies.length * 100);
        
        // Continue with next company despite error
        setTimeout(() => {
          this.importCompaniesSequentially(companies, index + 1);
        }, 100);
      }
    });
  }

  // Navigation methods
  navigateToCompanies(): void {
    this.router.navigate(['/companies']);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Get row class based on validation and selection state
  getRowClass(index: number): string {
    const hasIssues = this.rowIssues.some(issue => issue.index === index);
    const isSelected = this.selectedRows[index];
    
    if (hasIssues) {
      return isSelected ? 'bg-red-50' : 'bg-red-50 opacity-50';
    }
    
    return isSelected ? '' : 'opacity-50';
  }
  
  // Check if a row has issues
  hasIssues(index: number): boolean {
    return this.rowIssues.some(issue => issue.index === index);
  }
  
  // Get issues for a specific row
  getIssues(index: number): string[] {
    const issue = this.rowIssues.find(issue => issue.index === index);
    return issue ? issue.issues : [];
  }


  // Get employee name by ID
  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unassigned';
  }
  
  // Set team assignment for a company row
  assignTeamMember(rowIndex: number, employeeId: number): void {
    this.companyTeamAssignments[rowIndex] = employeeId;
  }
    // Navigation methods
    getStatusColor(status: number): ThemePalette {
      switch(status) {
        case 0: return 'primary'; // OK
        case 1: return 'accent';  // Company exists + new lead
        case 2: return 'warn';    // Both exist
        case 3: return 'warn';    // Error
        default: return undefined;
      }
    }
  
// Update the getStatusText method to use translations
getStatusText(status: number): string {
  const translationKeys : Record<number, string> =  {
    0: 'IMPORT.STATUS.SUCCESS',
    1: 'IMPORT.STATUS.NEW_LEAD',
    2: 'IMPORT.STATUS.EXISTS',
    3: 'IMPORT.STATUS.ERROR'
  };
  
  const key = translationKeys[status] || 'IMPORT.STATUS.UNKNOWN';
  return this.translocoService.translate(key);
}
  
    resetImport(): void {
      this.resetFile();
      this.importResults = [];
      this.importProgress = 0;
      this.importSummary = {
        totalProcessed: 0,
        successful: 0,
        existingCompanies: 0,
        existingLeads: 0,
        errors: 0
      };
    }

// First, add this method to the CompanyImportComponent class
// This implements the draft order algorithm for assigning employees
applyDraftOrderAssignments(): void {
  // Create a copy of employees array to work with
  const availableEmployees = [...this.employees];
  
  // Shuffle the employees to randomize initial order
  this.shuffleArray(availableEmployees);
  
  // Get selected rows
  const selectedRows = this.fileData.filter((_, index) => this.selectedRows[index]);
  
  // Only assign to rows that don't already have an assignment
  const unassignedSelectedRows = selectedRows
  
    .map((row, i) => ({ 
      row, 
      originalIndex: this.fileData.indexOf(row)
    }));
    /*.filter(item => !this.companyTeamAssignments[item.originalIndex]);*/
  
  
  // Implement a proper "snake draft" algorithm
  let employeeIndex = 0;
  let direction = 1; // 1 for forward, -1 for backward
  
  for (let i = 0; i < unassignedSelectedRows.length; i++) {
    const { originalIndex } = unassignedSelectedRows[i];
    
    // Assign the current employee
    this.companyTeamAssignments[originalIndex] = availableEmployees[employeeIndex].id;
    
    // Move to next employee in the snake pattern
    employeeIndex += direction;
    
    // Check if we need to change direction
    if (employeeIndex >= availableEmployees.length) {
      // We've reached the end, go back one step and reverse direction
      employeeIndex = availableEmployees.length - 1;
      direction = -1;
    } else if (employeeIndex < 0) {
      // We've reached the beginning, go back one step and reverse direction
      employeeIndex = 0;
      direction = 1;
    }
  }
}
// Helper method to shuffle an array (Fisher-Yates algorithm)
private shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

}