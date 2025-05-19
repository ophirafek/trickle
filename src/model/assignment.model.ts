// assignment.model.ts
export interface Assignment {
    id: number;
    companyID: number;
    assignmentTypeCode: number;
    employeeID: number;
    openingEffecDate?: Date;
    closingEffecDate?: Date;
    openingRegDate?: Date;
    closingRegDate?: Date;
    openingRef?: number;
    closingRef?: number;
    activeFlag: number;
    
    // Derived properties for display
    assignmentTypeName?: string;
    employeeName?: string;
    departmentName?: string;
  }