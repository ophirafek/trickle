// Update Employee interface in src/model/types.ts
// Note: Only showing the Employee interface update, keep all other interfaces unchanged

export interface Employee {
    id: number;
    name: string;
    department: string;
    position: string;
    email?: string;
    phone?: string;
    employeeId?: string; // Added from API
    activeFlag?: boolean; // Added from API
    openingEffectiveDate?: string; // Added from API
    closingEffectiveDate?: string; // Added from API
  }