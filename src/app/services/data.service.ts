import { Injectable } from '@angular/core';
import { Lead, Meeting } from '../../model/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

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

  
  getMeetings(): Meeting[] {
    return this.meetings;
  }

  getLeads(): Lead[] {
    return this.leads;
  }

}
