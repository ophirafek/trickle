import { Injectable } from '@angular/core';
import { Company, Lead, Meeting } from '../../model/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
  private companies: Company[] = [
    { 
      name: 'Acme Corporation', 
      industry: 'Technology', 
      size: '500-1000 employees',
      location: 'San Francisco, CA',
      website: 'www.acme.com'
    },
    { 
      name: 'Global Industries', 
      industry: 'Manufacturing', 
      size: '1000-5000 employees',
      location: 'Chicago, IL',
      website: 'www.global-ind.com'
    },
    { 
      name: 'Tech Innovations', 
      industry: 'Software', 
      size: '100-500 employees',
      location: 'Austin, TX',
      website: 'www.techinno.com'
    },
    { 
      name: 'Future Systems', 
      industry: 'Technology', 
      size: '50-100 employees',
      location: 'Seattle, WA',
      website: 'www.futuresys.com'
    },
    { 
      name: 'Smart Solutions', 
      industry: 'Consulting', 
      size: '200-500 employees',
      location: 'Boston, MA',
      website: 'www.smartsol.com'
    }
  ];

  private meetings: Meeting[] = [
    {
      id: 1,
      title: 'Product Demo',
      type: 'Demo',
      company: 'Acme Corporation',
      date: '2025-02-24',
      time: '10:00 AM',
      duration: '45 minutes',
      status: 'Upcoming',
      attendees: [
        { name: 'John Smith', role: 'Sales Manager', company: 'Our Company' },
        { name: 'Sarah Chen', role: 'Product Manager', company: 'Our Company' },
        { name: 'Mike Johnson', role: 'CTO', company: 'Acme Corporation' }
      ]
    },
    {
      id: 2,
      title: 'Initial Consultation',
      type: 'Sales',
      company: 'Tech Innovations',
      date: '2025-02-24',
      time: '2:00 PM',
      duration: '30 minutes',
      status: 'Upcoming',
      attendees: [
        { name: 'Lisa Wong', role: 'Account Executive', company: 'Our Company' },
        { name: 'David Miller', role: 'CEO', company: 'Tech Innovations' }
      ]
    },
    {
      id: 3,
      title: 'Project Kickoff',
      type: 'Internal',
      company: 'Global Industries',
      date: '2025-02-25',
      time: '11:00 AM',
      duration: '60 minutes',
      status: 'Upcoming',
      attendees: [
        { name: 'Sarah Chen', role: 'Product Manager', company: 'Our Company' },
        { name: 'Tom Wilson', role: 'Project Manager', company: 'Global Industries' },
        { name: 'Anna Brown', role: 'Developer', company: 'Our Company' }
      ]
    }
  ];

  private leads: Lead[] = [
    {
      title: 'Enterprise Software Implementation',
      company: 'Acme Corporation',
      status: 'Qualified',
      value: 75000,
      probability: 65,
      owner: 'Sarah Chen',
      lastUpdate: '2 hours ago'
    },
    {
      title: 'Cloud Migration Project',
      company: 'Global Industries',
      status: 'Proposal',
      value: 120000,
      probability: 80,
      owner: 'Michael Scott',
      lastUpdate: '1 day ago'
    },
    {
      title: 'Security Assessment',
      company: 'Tech Innovations',
      status: 'New',
      value: 45000,
      probability: 30,
      owner: 'John Smith',
      lastUpdate: '3 days ago'
    }
  ];

  getCompanies(): Company[] {
    return this.companies;
  }

  getMeetings(): Meeting[] {
    return this.meetings;
  }

  getLeads(): Lead[] {
    return this.leads;
  }

}
