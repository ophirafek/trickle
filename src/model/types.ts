export interface MenuItem {
  id: string;
  icon: string;
  label: string;
}

// Update the Company interface in src/model/types.ts
export interface Company {
  // existing fields
  id: number;
  idTypeCode: number;
  registrationName: string;
  // new fields
  tradeName?: string;
  englishName?: string;
  businessFieldCode?: number;
  entityTypeCode?: number;
  companyStatusCode?: number;  // renamed from statusCode
  vatNumber?: string;
  emailAddress?: string;      // renamed from email
  phoneNumber?: string;
  faxNumber?: string;
  yearsActive?: number;
  countryCode?: number;       // added country code
  // existing fields
  website: string;
  registrationNumber: string;
  dunsNumber: string;
  contacts: Contact[];
  notes: Note[];
  isInsured: boolean;
  isDebtor: boolean;
  isPotentialClient: boolean;
  isAgent: boolean;
  // other fields
  streetAddress?: string;
  suite?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  foundingYear?: number;
  insuredDetails?: {
    sizeCode?: number;
    statusCode?: number;
  };
  exposure?: number;
  currencyCode?: number;
}
// Updated Contact interface in src/model/types.ts
export interface Contact {
  id: number;
  companyID: number;
  contactCode?: number;
  personalID?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  cellNumber?: string;
  faxNumber?: string;
  email?: string;
  position?: string;
  department?: string;
  notes?: string;
  openingEffecDate?: Date;
  closingEffecDate?: Date;
  openingRegDate?: Date;
  closingRegDate?: Date;
  openingRef?: number;
  closingRef?: number;
  activeFlag: boolean;
  
  // Computed property for full name display
  fullName?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  companyId: number;
}

export interface Meeting {
  id: number;
  title: string;
  type: string;
  company: string;
  companyId?: number;  // Added to link to company record
  date: string;
  time: string;
  duration: string;
  status: string;
  attendees: Attendee[];
  location?: string;
  description?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Attendee {
  name: string;
  role: string;
  company: string;
}

// Updated Lead interface to match new database structure
export interface Lead {
  leadId?: number;
  leadName: string;
  companyId: number;
  leadTypeCode?: number;
  leadSourceCode?: number;
  contactId?: number;
  currencyCode?: number;
  marketCode?: number;
  agentId?: number;
  ownerEmployeeId?: number;
  probability: number;
  score?: number;
  employees?: number;
  actualSalesValue?: number;
  salesGapValue?: number;
  activityExpansion?: string;
  exportMarketValue?: number;
  localMarketValue?: number;
  exportRatio?: number;
  region?: string;
  currentInsurerNo?: string;
  externalStartDate?: Date;
  statusCode?: number;
  reasonRejectionCode?: number;
  rejectionDetail?: string;
  notes?: string;
  additionalInfo?: string;
  openingEffectiveDate?: Date;
  closingEffectiveDate?: Date;
  openingRegistrationDate?: Date;
  closingRegistrationDate?: Date;
  openingReference?: number;
  closingReference?: number;
  activeFlag?: boolean;

  // Computed properties for display
  leadTypeName?: string;
  leadStatusName?: string;
  marketName?: string;
  contactName?: string;
  ownerName?: string;
  companyName?: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  color: string;
}

export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  email?: string;
  phone?: string;
}

export interface ImportResult {
  status: number; // 0: OK, 1: Company exists + new lead, 2: Both exist, 3: Error
  companyName: string;
  description?: string;
  errorMessage?: string;
}