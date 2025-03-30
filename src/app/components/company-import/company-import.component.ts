import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Company } from '../../../model/types';

@Component({
  selector: 'app-company-import',
  templateUrl: './company-import.component.html',
  styleUrls: ['./company-import.component.css']
})
export class CompanyImportComponent {
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onImport = new EventEmitter<Company[]>();

  fileSelected: boolean = false;
  fileName: string = '';
  fileSize: string = '';
  fileIcon: string = '';
  parseError: string = '';
  previewData: any[] = [];
  previewHeaders: string[] = [];
  fieldMapping: { [key: string]: string } = {};
  
  // Track current step in the import process
  currentStep: 'file-selection' | 'field-mapping' | 'review' = 'file-selection';
  
  // Track which rows are selected for import
  selectedRows: boolean[] = [];
  allRowsSelected: boolean = true;
  
  // Track which rows have issues (missing required fields, etc.)
  rowIssues: { index: number, issues: string[] }[] = [];
  
  requiredFields = [
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'size', label: 'Size' },
    { key: 'location', label: 'Location' },
    { key: 'website', label: 'Website' }
  ];

  public fileData: any[] = [];
  private selectedFile: File | null = null;

  get canProceedToMapping(): boolean {
    return this.fileSelected && 
           this.previewData.length > 0 && 
           !this.parseError;
  }
  
  get canProceedToReview(): boolean {
    // Check if all required fields are mapped
    return this.requiredFields.every(field => !!this.fieldMapping[field.key]);
  }
  
  get canImport(): boolean {
    return this.selectedRows.some(row => row) && 
           this.currentStep === 'review';
  }
  
  get selectedRowCount(): number {
    return this.selectedRows.filter(selected => selected).length;
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

  proceedToMapping(): void {
    this.currentStep = 'field-mapping';
  }
  
  proceedToReview(): void {
    this.currentStep = 'review';
    this.validateRows();
  }
  
  goBack(): void {
    if (this.currentStep === 'field-mapping') {
      this.currentStep = 'file-selection';
    } else if (this.currentStep === 'review') {
      this.currentStep = 'field-mapping';
    }
  }
  
  validateRows(): void {
    this.rowIssues = [];
    
    this.fileData.forEach((row, index) => {
      const issues: string[] = [];
      
      this.requiredFields.forEach(field => {
        const sourceField = this.fieldMapping[field.key];
        const value = row[sourceField];
        
        if (!value || value.trim() === '') {
          issues.push(`Missing ${field.label}`);
        }
      });
      
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
      
      this.requiredFields.forEach(field => {
        const sourceField = this.fieldMapping[field.key];
        company[field.key] = row[sourceField] || '';
      });
      
      // Ensure ID is set to 0 for new companies
      company.id = 0;
      
      // Initialize collections to empty arrays
      company.contacts = [];
      company.notes = [];
      
      return company as Company;
    });
    
    this.onImport.emit(mappedCompanies);
    this.close();
  }

  close(): void {
    this.resetFile();
    this.onClose.emit();
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
}