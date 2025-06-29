// Create a new file: src/model/company-import-dto.ts
export interface CompanyImport {
    id: number;
    registrationNumber: string;  // Required
    registrationName: string;    // Required
    website?: string;
    streetAddress?: string;
    city?: string;
    postalCode?: string;
    phoneNumber?: string;
    businessDomain?: string;
    score?: number;
    actualSalesValue?: number;
    numOfEmployees?: number;
    assignedTeamMemberId?: number;
    assignedTeamMemberName?: string;
    contactName1?: string;
    contactRole1?: string;  // Fixed typo from ContacRole1
    contactName2?: string;
    contactRole2?: string;  // Fixed typo from ContacRole2
  }