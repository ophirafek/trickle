export interface MenuItem {
    id: string;
    icon: string;
    label: string;
  }
  
  export interface Company {
    name: string;
    industry: string;
    size: string;
    location: string;
    website: string;
  }
  
  export interface Meeting {
    id: number;
    title: string;
    type: string;
    company: string;
    date: string;
    time: string;
    duration: string;
    status: string;
    attendees: Attendee[];
  }
  
  export interface Attendee {
    name: string;
    role: string;
    company: string;
  }
  
  export interface Lead {
    title: string;
    company: string;
    status: string;
    value: number;
    probability: number;
    owner: string;
    lastUpdate: string;
  }
  
  export interface QuickAction {
    icon: string;
    label: string;
    color: string;
  }