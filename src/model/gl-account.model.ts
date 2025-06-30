// gl-account.model.ts
export interface GLAccount {
    id: number;
    companyID: number;
    accountNumber: string;
    accountTypeCode: number;
    openingEffecDate?: Date;
    closingEffecDate?: Date;
    openingRegDate?: Date;
    closingRegDate?: Date;
    openingRef?: number;
    closingRef?: number;
    activeFlag: boolean;
    
    // Derived properties for display
    accountTypeName?: string;
  }