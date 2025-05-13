import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-insured-tab',
  templateUrl: './insured-tab.component.html',
  styleUrls: ['./insured-tab.component.scss']
})
export class InsuredTabComponent implements OnInit {
  // Mock data for insured companies
  insuredCompanies = [
    { id: 1, name: 'Subsidiary A', relationship: 'Subsidiary', status: 'Active', policyNumber: 'POL-001' },
    { id: 2, name: 'Branch B', relationship: 'Branch', status: 'Active', policyNumber: 'POL-002' }
  ];

  constructor() { }

  ngOnInit(): void {
  }
  
  // Add a new insured company relationship
  addInsuredCompany(): void {
    console.log('Adding insured company');
  }
}