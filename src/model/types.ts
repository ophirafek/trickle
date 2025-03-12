export interface MenuItem {
  id: string;
  icon: string;
  label: string;
}

export interface Company {
  id: number;
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
  expectedCloseDate?: string;
  description?: string;
  nextSteps?: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  color: string;
}