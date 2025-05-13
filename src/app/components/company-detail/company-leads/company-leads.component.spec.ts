import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyLeadsComponent } from './company-leads.component';

describe('CompanyLeadsComponent', () => {
  let component: CompanyLeadsComponent;
  let fixture: ComponentFixture<CompanyLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanyLeadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
