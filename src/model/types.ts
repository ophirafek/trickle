// src/model/types.ts

export interface MenuItem {
  id: string;
  icon: string;
  label: string;
}

// Updated Company interface to match the new model structure with IdTypeCode after Id
export interface Company {
  id: number;
  idTypeCode: number;          // Added right after id as requested
  registrationNumber: string;
  dunsNumber?: string;
  vatNumber?: string;
  registrationName: string;
  tradeName?: string;
  englishName?: string;
  companyStatusCode: number;
  businessFieldCode: number;
  entityTypeCode: number;
  foundingYear?: number | null;
  countryCode: number;
  website?: string;
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  faxNumber?: string;
  emailAddress?: string;
  remarks?: string;
  lastReportDate?: Date | null;
  lastReportName?: string;
  openingEffectiveDate?: Date | null;
  closingEffectiveDate?: Date | null;
  openingRegDate?: Date | null;
  closingRegDate?: Date | null;
  openingRef?: string;
  closingRef?: string;
  assignedTeamMemberId?: number|  null;
  assignedTeamMemberName?: string;
  obligatoryAmount: any;
  isDebtor?: boolean;
  isPotentialCustomer?: boolean;
  isInsuredCompany?: boolean;
  isAgent?: boolean;
  
  contacts?: Contact[];
  notes?: Note[];
}

export interface Contact {
  id: number;
  companyId?: number;
  firstName: string;
  lastName: string;
  role: string;
  belongsTo: string;
  department?: string;
  telephone?: string;
  mobile?: string;
  email?: string;
  notes?: string;
}

export interface Account {
  id: number;
  companyId?: number;
  accountNumber: string;
  accountType: string;
  status: string;
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
  companyId?: number;  
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

export interface Lead {
  id?: number;
  leadName: string;
  leadTypeCode: number;
  company?: string;
  companyId?: number;
  status: string;
  value?: number;
  probability: number;
  salesGapValue: number;
  contactName: string;
  owner?: string;
  lastUpdate?: string;
  source?: string;
  expectedCloseDate?: Date;
  description?: string;
  nextSteps?: string;
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
  employeeId?: string;
  activeFlag?: boolean;
  openingEffectiveDate?: string;
  closingEffectiveDate?: string;
}

export interface ImportResult {
  status: number;
  companyName: string;
  description?: string;
  errorMessage?: string;
}

export interface GeneralCode {
  codeNumber: number;
  codeShortDescription: string;
  codeLongDescription?: string;
  isActive: boolean;
}

// Lookup data for dropdowns
export interface LookupData {
  idTypes: LookupItem[];
  countries: LookupItem[];
  businessFields: LookupItem[];
  companyStatuses: LookupItem[];
  entityTypes: LookupItem[];
  leadTypes: LookupItem[];
  leadSources: LookupItem[];
  marketTypes: LookupItem[];
  accountTypes: LookupItem[];
}

export interface LookupItem {
  code: number;
  value: string;
}

// Filter interface
export interface CompanyFilter {
  companyName: string;
  primaryId: string;
  country: string;
  businessField: string;
  companyStatus: string;
  entityType: string;
  obligatoryMin: string;
  obligatoryMax: string;
}