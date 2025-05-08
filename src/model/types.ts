export interface MenuItem {
  id: string;
  icon: string;
  label: string;
}

// Update the Company interface in src/model/types.ts
export interface Company {
  id: number;
  idTypeCode?: number;          // New field: Defines the type of registration number
  name: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  status?: string;
  streetAddress?: string;
  suite?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  billingStreet?: string;
  billingCity?: string;
  billingPostalCode?: string;
  linkedInProfile?: string;
  foundingYear?: number;
  description?: string;
  registrationNumber?: string;  // Added field
  dunsNumber?: string;         // Added field
  createdAt?: Date;
  updatedAt?: Date;
  contacts?: Contact[];
  notes?: Note[];
}

export interface Contact {
  id: number;
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  companyId: number;
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

export interface Lead {
  id?: number;
  title: string;
  company: string;
  companyId?: number;
  status: string;
  value: number;
  probability: number;
  owner: string;
  lastUpdate: string;
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
}

export interface ImportResult {
  status: number; // 0: OK, 1: Company exists + new lead, 2: Both exist, 3: Error
  companyName: string;
  description?: string;
  errorMessage?: string;
}